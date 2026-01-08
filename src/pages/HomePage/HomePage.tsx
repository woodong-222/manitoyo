import { Link } from "react-router-dom";
import logo from "../../assets/logo.svg";
import "./HomePage.css";

function HomePage() {
  return (
    <section className="home-page">
      <div className="home-page__wrap">
        <div className="home-page__circle" />
        <div className="home-page__content">
          <div className="brand-font home-page__brand">
            <img src={logo} alt="Manitoyo logo" className="home-page__logo" />
            <div className="home-page__titles">
              <p className="home-page__subtitle">나만의 마니또 게임</p>
              <h2 className="home-page__title">Manitoyo</h2>
            </div>
          </div>
          <p className="home-page__desc">
            마니또 게임을 쉽고 빠르게, 비밀은 끝까지
          </p>

          <div className="home-page__actions">
            <div className="home-page__action-stack">
              <Link to="/create" className="home-page__primary">
                방 만들기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomePage;
