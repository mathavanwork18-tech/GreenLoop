import { useNavigate } from 'react-router-dom'
import './Hero.css'
import greenLoopLogo from '../../assets/branding/green-loop-logo.png'
import ewasteHeroImg from '../../assets/hero/ewaste-hero.png'
import Icon from '../Icon'

interface HeroProps {
  onExploreClick?: () => void
}

export default function Hero({ onExploreClick }: HeroProps) {
  const navigate = useNavigate()

  const handleExplore = () => {
    if (onExploreClick) {
      onExploreClick()
    } else {
      const feedEl = document.getElementById('marketplace-feed')
      if (feedEl) {
        feedEl.scrollIntoView({ behavior: 'smooth' })
      } else {
        navigate('/marketplace')
      }
    }
  }

  return (
    <section className="hero-section" aria-label="Green Loop Hero Section">
      {/* Background Ambient Glows */}
      <div className="hero-glow-1" aria-hidden="true" />
      <div className="hero-glow-2" aria-hidden="true" />

      <div className="hero-container">
        {/* ================= LEFT SIDE: BRANDING & CALL TO ACTIONS ================= */}
        <div className="hero-content">
          {/* Official Green Loop Brand Badge */}
          <div className="hero-brand-pill">
            <img
              src={greenLoopLogo}
              alt="Green Loop E-Waste Management"
              className="hero-brand-logo-small"
            />
            <span className="hero-brand-tagline">Circular Economy • Zero Landfill</span>
          </div>

          {/* Main Headline */}
          <h1 className="hero-title">
            Give Your E-Waste <br />
            <span className="hero-title-highlight">a Second Life</span>
          </h1>

          {/* Supporting Description */}
          <p className="hero-description">
            Recycle, reuse and reconnect with electronics that still have value. Join India's verified circular ecosystem to safely trade, repair, and sustainably recycle old devices while earning Green Coins.
          </p>

          {/* Quick Value Points */}
          <div className="hero-highlights">
            <div className="hero-highlight-item">
              <Icon name="sparkles" size={15} color="#34d399" />
              <span>AI Vision Scan</span>
            </div>
            <div className="hero-highlight-item">
              <Icon name="verified" size={15} color="#34d399" />
              <span>TNPCB Certified Hubs</span>
            </div>
            <div className="hero-highlight-item">
              <Icon name="coin" size={15} color="var(--coin-color)" />
              <span>Green Coin Rewards</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="hero-cta-group">
            <button
              onClick={handleExplore}
              className="hero-btn-primary"
              aria-label="Explore E-Waste marketplace and circular feed"
            >
              <span>Explore E-Waste</span>
              <Icon name="arrow-right" size={18} color="#ffffff" />
            </button>

            <button
              onClick={() => navigate('/post')}
              className="hero-btn-secondary"
              aria-label="Post an electronic item for recycling or resale"
            >
              <Icon name="camera" size={18} color="#34d399" />
              <span>Post an Item</span>
            </button>
          </div>
        </div>

        {/* ================= RIGHT SIDE: E-WASTE HERO PNG ILLUSTRATION ================= */}
        <div className="hero-image-wrapper">
          <img
            src={ewasteHeroImg}
            alt="Green Loop electronic waste recycling and reuse illustration"
            className="hero-illustration"
          />
        </div>
      </div>
    </section>
  )
}
