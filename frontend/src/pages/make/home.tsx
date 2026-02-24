import { Link } from 'react-router-dom'
import './home.scss'

const cubeFaces = ['front', 'back', 'right', 'left', 'top', 'bottom'] as const
const faceTiles = Array.from({ length: 9 }, (_, index) => index)

export const HomePage = () => {
    return (
        <div className="home-page">
            <div className="home-cube-scene" aria-hidden="true">
                <div className="home-cube">
                    {cubeFaces.map(face => (
                        <div key={face} className={`home-cube-face home-cube-face-${face}`}>
                            {faceTiles.map(tile => (
                                <span key={`${face}-${tile}`} className="home-cube-tile" />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            <h1>Welcome to Quizmaster! You rock.</h1>
            <Link to="/question/new">Create new question</Link>
            <br />
            <Link to="/workspace/new">Create new workspace</Link>
        </div>
    )
}
