import { useState } from 'react'
import { Link } from 'react-router-dom'
import './home.scss'

const cubeFaces = ['front', 'back', 'right', 'left', 'top', 'bottom'] as const
const faceTiles = Array.from({ length: 9 }, (_, index) => index)
const cubeRotations = [
    'rotateX(-20deg) rotateY(0deg)',
    'rotateX(28deg) rotateY(72deg) rotateZ(10deg)',
    'rotateX(-38deg) rotateY(150deg) rotateZ(-8deg)',
    'rotateX(16deg) rotateY(226deg) rotateZ(14deg)',
    'rotateX(-30deg) rotateY(304deg) rotateZ(-6deg)',
    'rotateX(42deg) rotateY(378deg) rotateZ(12deg)',
]

export const HomePage = () => {
    const [rotationIndex, setRotationIndex] = useState(0)

    const handleCubeClick = () => {
        setRotationIndex(previousIndex => (previousIndex + 1) % cubeRotations.length)
    }

    return (
        <div className="home-page">
            <button type="button" className="home-cube-scene" onClick={handleCubeClick} aria-label="Rotate cube">
                <div className="home-cube" data-testid="home-cube" style={{ transform: cubeRotations[rotationIndex] }}>
                    {cubeFaces.map(face => (
                        <div key={face} className={`home-cube-face home-cube-face-${face}`}>
                            {faceTiles.map(tile => (
                                <span key={`${face}-${tile}`} className="home-cube-tile" />
                            ))}
                        </div>
                    ))}
                </div>
            </button>
            <h1>Welcome to Quizmaster! You rock.</h1>
            <Link to="/question/new">Create new question</Link>
            <br />
            <Link to="/workspace/new">Create new workspace</Link>
        </div>
    )
}
