package cz.scrumdojo.quizmaster.quiz;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@JsonIgnoreProperties(ignoreUnknown = true)
@Entity
public class Quiz {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String title;
    private String description;

    @Column(name = "questions", columnDefinition = "int[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    private int[] questionIds;

    @Enumerated(EnumType.STRING)
    private QuizMode mode;
    private int passScore;
    private Integer timeLimit; // time limit in seconds, null means no limit

    private int timesTaken;
    private int timesFinished;
    private double averageScore;
    private String workspaceGuid; // Workspace GUID
    private Integer size;
    
    @Column(nullable = true)
    private Integer finalCount;
}
