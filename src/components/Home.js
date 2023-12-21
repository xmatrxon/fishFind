import { useState } from "react";
import Select from "react-select";
import StrikeCallendar from "./StrikeCallendar";
import { cityList } from "../cityList";

const Home = () => {
  const [city, setCity] = useState("Warszawa");
  const [displayCity, setDisplayCity] = useState("Warszawa");

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
