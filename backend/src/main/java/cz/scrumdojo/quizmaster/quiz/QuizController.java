package cz.scrumdojo.quizmaster.quiz;

import cz.scrumdojo.quizmaster.question.Question;
import cz.scrumdojo.quizmaster.question.QuestionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import cz.scrumdojo.quizmaster.QuizUtils;
import java.util.*;

@Slf4j
@RestController
@RequestMapping("/api")
public class QuizController {

    private final QuestionRepository questionRepository;
    private final QuizRepository quizRepository;
    private final QuizStatsRepository quizStatsRepository;

    @Autowired
    public QuizController(QuestionRepository questionRepository,
                          QuizRepository quizRepository,
                          QuizStatsRepository quizStatsRepository) {
        this.questionRepository = questionRepository;
        this.quizRepository = quizRepository;
        this.quizStatsRepository = quizStatsRepository;
    }

    @Transactional
    @GetMapping("/quiz/{id}")
    public ResponseEntity<QuizResponse> getQuiz(@PathVariable Integer id) {
        Quiz quiz = quizRepository.findById(id).orElse(null);
        if (quiz == null) {
            return ResponseEntity.notFound().build();
        }

        QuizStats stats = quizStatsRepository.findByQuizId(id);
        if (stats == null) {
            stats = new QuizStats();
            stats.setQuiz(quiz);
            quizStatsRepository.save(stats);
        }

        int questionsLimit = (quiz.getSize() != null && quiz.getSize() > 0)
                ? quiz.getSize()
                : quiz.getQuestionIds().length;

        Question[] questions = new Question[questionsLimit];
        for (int i = 0; i < questionsLimit; i++) {
            questions[i] = questionRepository.getReferenceById(quiz.getQuestionIds()[i]);
        }

        if (quiz.getFinalCount() != null && quiz.getFinalCount() > 0  && questions.length > 0) {
            List<Question> questionList = Arrays.asList(questions);
            Collections.shuffle(questionList);
            questions = questionList.subList(0, quiz.getFinalCount())
                    .toArray(new Question[quiz.getFinalCount() - 1]);
                    questions = QuizUtils.shrinkQuestions(questions, quiz.getFinalCount());
        }

        QuizResponse build = QuizResponse.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .questions(questions)
                .mode(quiz.getMode())
                .easyMode(EasyMode.PERQUESTION)
                .passScore(quiz.getPassScore())
                .timeLimit(quiz.getTimeLimit())
                .timesTaken(stats.getTimesTaken())
                .timesFinished(stats.getTimesFinished())
                .averageScore(stats.getAverageScore())
                .timeoutCount(stats.getTimeoutCount())
                .failureRate(stats.getFailureRate())
                .successRate(stats.getSuccessRate())
                .averageTime(stats.getAverageTime())
                .size(quiz.getSize())
                .build();

        return ResponseEntity.ok(build);
    }

    @Transactional
    @PostMapping("/quiz")
    public ResponseEntity<Integer> createQuiz(@RequestBody Quiz quizInput) {
        Quiz output = quizRepository.save(quizInput);
        QuizStats stats = new QuizStats();
        stats.setQuiz(output);
        quizStatsRepository.save(stats);
        return ResponseEntity.ok(output.getId());
    }

    @Transactional
    @PutMapping("/quiz/{id}/start")
    public ResponseEntity<Void> updateQuizCounts(@PathVariable Integer id) {
        QuizStats stats = quizStatsRepository.findByQuizId(id);
        if (stats == null) {
            return ResponseEntity.notFound().build();
        }

        stats.setTimesTaken(stats.getTimesTaken() + 1);
        quizStatsRepository.save(stats);

        return ResponseEntity.ok().build();
    }

    @Transactional
    @PutMapping("/quiz/{id}/evaluate")
    public ResponseEntity<Void> updateQuizFinishedCounts(
            @PathVariable Integer id,
            @RequestBody ScoreRequest payload) {

        double scorePct = payload.getScore();
        boolean passed = payload.isPassed();

        Quiz quiz = quizRepository.findById(id).orElse(null);
        if (quiz == null) {
            return ResponseEntity.notFound().build();
        }

        QuizStats stats = quizStatsRepository.findByQuizId(id);
        if (stats == null) {
            return ResponseEntity.notFound().build();
        }

        if (!passed) {
            passed = scorePct >= quiz.getPassScore();
        }

        if (passed) {
            stats.setTimesFinished(stats.getTimesFinished() + 1);
        }

        int totalAttempts = stats.getTimesTaken();
        if (totalAttempts > 0) {
            double newAvgScore = stats.getAverageScore() +
                    (scorePct - stats.getAverageScore()) / totalAttempts;
            stats.setAverageScore(newAvgScore);
        }

        double successRate = (stats.getTimesTaken() > 0)
                ? (stats.getTimesFinished() * 100.0) / stats.getTimesTaken()
                : 0.0;

        stats.setSuccessRate(successRate);
        stats.setFailureRate(100.0 - successRate);

        quizStatsRepository.save(stats);
        return ResponseEntity.ok().build();
    }

}
