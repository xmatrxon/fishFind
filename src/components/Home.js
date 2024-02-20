import { useState } from "react";
import Select from "react-select";
import StrikeCallendar from "./StrikeCallendar";
import { cityList } from "../cityList";
import { useLoading } from "./LoadingContext";
import { Link } from "react-router-dom";
import Footer from "./Footer";

const Home = () => {
  const [city, setCity] = useState("Warszawa");
  const [displayCity, setDisplayCity] = useState("Warszawa");
  const { isLoading, setLoading } = useLoading();

  const handleVoivodeship = (data) => {
    setCity(data.value);
    setDisplayCity(data.label);
  };

  if (isLoading) {
    return (
      <>
        <div className="flex h-[calc(100vh-48px)] items-center justify-center">
          <p className="pr-3">Ładowanie </p>
          <svg
            className="-ml-1 mr-3 h-5 w-5 animate-spin text-black"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </>
    );
  }

  return (
    <div className="home">
      {/* OBRAZ GŁÓWNY */}
      <div className="header">
        <h1 className="header__heading ">FishFind</h1>
        <p className="header__text">
          Jedyny portal wędkarski jakiego potrzebujesz!
        </p>
        <Link className="header__btn btn-special-animation" to={"/map"}>
          Otwórz mapę
        </Link>
        <div className="white-block white-block-left"></div>
      </div>
      {/* O NAS */}
      <div className="usage">
        <div className="section-padding">
          <div>
            <h2 className="section-heading">Nasz portal umożliwia</h2>
          </div>
          <div className="icon-component">
            <div className="icons">
              <p className="icon-block">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="icon icon-tabler icon-tabler-file-plus"
                  width={48}
                  height={48}
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                  <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                  <path d="M12 11l0 6" />
                  <path d="M9 14l6 0" />
                </svg>
              </p>
              <p>Dodawanie nowych łowisk</p>
            </div>
            <div className="icons">
              <p className="icon-block">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="icon icon-tabler icon-tabler-message-plus"
                  width={48}
                  height={48}
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M8 9h8" />
                  <path d="M8 13h6" />
                  <path d="M12.01 18.594l-4.01 2.406v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v5.5" />
                  <path d="M16 19h6" />
                  <path d="M19 16v6" />
                </svg>
              </p>
              <p>Komentowanie łowisk</p>
            </div>
            <div className="icons">
              <p className="icon-block">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="icon icon-tabler icon-tabler-search"
                  width={48}
                  height={48}
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                  <path d="M21 21l-6 -6" />
                </svg>
              </p>
              <p> Wyszukiwanie łowisk po wielu parametrach</p>
            </div>
            <div className="icons">
              <p className="icon-block">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="icon icon-tabler icon-tabler-map"
                  width={48}
                  height={48}
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M3 7l6 -3l6 3l6 -3v13l-6 3l-6 -3l-6 3v-13" />
                  <path d="M9 4v13" />
                  <path d="M15 7v13" />
                </svg>
              </p>
              <p> Przeglądanie mapy łowisk</p>
            </div>
          </div>
        </div>
      </div>
      {/* Kalendarz */}
      <div className="hero-img">
        <div className="black-block white-block-left"></div>
        <div className="white-block white-block-right"></div>
        <p className="hero-img__title">Kalendarz brań</p>
        <div className="big-div">
          <div className="small-div">
            <form action="">
              <Select
                aria-label="City"
                className="select-box text-black"
                options={cityList}
                placeholder="Miasto"
                onChange={handleVoivodeship}
                isMulti={false}
              />
            </form>
            <h2>Brania dla {displayCity}</h2>
            <StrikeCallendar city={city} />
          </div>
        </div>
      </div>
      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default Home;
