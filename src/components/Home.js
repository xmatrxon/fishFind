import { useState } from "react";
import Select from "react-select";
import StrikeCallendar from "./StrikeCallendar";

const Home = () => {
  const [city, setCity] = useState("Warszawa");
  const [displayCity, setDisplayCity] = useState("Warszawa");

  const cityList = [
    { value: "Bialystok", label: "Białystok" },
    { value: "Bydgoszcz", label: "Bydgoszcz" },
    { value: "Gdańsk", label: "Gdańsk" },
    { value: "Gorzów_Wielkopolski", label: "Gorzów Wielkopolski" },
    { value: "Katowice", label: "Katowice" },
    { value: "Kielce", label: "Kielce" },
    { value: "Cracow", label: "Kraków" },
    { value: "Lublin", label: "Lublin" },
    { value: "Lodz", label: "Łódź" },
    { value: "Olsztyn", label: "Olsztyn" },
    { value: "Opole", label: "Opole" },
    { value: "Poznan", label: "Poznań" },
    { value: "Rzeszów", label: "Rzeszów" },
    { value: "Szczecin", label: "Szczecin" },
    { value: "Warszawa", label: "Warszawa" },
    { value: "Wroclaw", label: "Wrocław" },
    { value: "Zielona_Góra", label: "Zielona Góra" },
  ];

  const handleVoivodeship = (data) => {
    setCity(data.value);
    setDisplayCity(data.label);
  };

  return (
    <>
      <div>
        <h1>HOME</h1>
        <div className="flex justify-center">
          <div>
            <form action="">
              <Select
                className=""
                options={cityList}
                placeholder="Miasto"
                value={city}
                onChange={handleVoivodeship}
                isMulti={false}
              />
            </form>
            <h2>Pogoda dla {displayCity}</h2>
            <StrikeCallendar city={city} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
