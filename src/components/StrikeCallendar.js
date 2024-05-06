import { useEffect, useState } from "react";
import FishIcon from "./FishIcon";
import Popup from "./Popup";

const StrikeCallendar = ({ lat, lon, city }) => {
  const api_Key = process.env.REACT_APP_WEATHER_API_KEY;

  const [weather, setWeather] = useState([]);
  const [pressureData, setPressureData] = useState([]);
  const [dayPoints, setDayPoints] = useState([]);
  const [isOpenPopup, setIsOpenPopup] = useState(false);

  const fetchWeather = async () => {
    if (city) {
      try {
        const response = await fetch(
          `https://api.weatherapi.com/v1/forecast.json?key=${api_Key}&q=${city}&days=3`,
        );
        const data = await response.json();
        setWeather(data);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    } else {
      try {
        const response = await fetch(
          `https://api.weatherapi.com/v1/forecast.json?key=${api_Key}&q=${lat},${lon}&days=3`,
        );
        const data = await response.json();
        setWeather(data);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [city]);

  const calculatePressureDifference = () => {
    const newPressureData = weather.forecast.forecastday.map((day) => {
      const pressures = day.hour.map((hour) => hour.pressure_mb);

      const minPressure = Math.min(...pressures);
      const maxPressure = Math.max(...pressures);
      const pressureDifference = maxPressure - minPressure;

      return {
        date: day.date,
        minPressure,
        maxPressure,
        pressureDifference,
      };
    });

    setPressureData(newPressureData);
  };

  const calculateDay = () => {
    if (!weather.forecast) {
      return;
    }

    const newDayPoints = pressureData.map((data, index) => {
      let temperaturePoints = 0;
      let pressurePoints = 0;
      let moonPoints = 0;
      let rainPoints = 0;
      let pointsMessage = "";
      let iconColor = "";

      if (
        weather.forecast.forecastday[index].day.avgtemp_c > 0 &&
        weather.forecast.forecastday[index].day.avgtemp_c <= 10
      ) {
        temperaturePoints = 3;
      } else if (
        weather.forecast.forecastday[index].day.avgtemp_c > 10 &&
        weather.forecast.forecastday[index].day.avgtemp_c <= 25
      ) {
        temperaturePoints = 5;
      } else if (
        weather.forecast.forecastday[index].day.avgtemp_c > 25 &&
        weather.forecast.forecastday[index].day.avgtemp_c < 30
      ) {
        temperaturePoints = 3;
      } else {
        temperaturePoints = 0;
      }

      if (data.pressureDifference > 10) {
        pressurePoints = 0;
      } else {
        pressurePoints = 5;
      }

      if (weather.forecast.forecastday[index].day.daily_chance_of_rain > 50) {
        rainPoints = 5;
      }

      if (weather.forecast.forecastday[index].astro.moon_phase === "New Moon") {
        moonPoints = 5;
      } else if (
        weather.forecast.forecastday[index].astro.moon_phase ===
          "First Quarter" ||
        weather.forecast.forecastday[index].astro.moon_phase === "Last Quarter"
      ) {
        moonPoints = 4;
      } else if (
        weather.forecast.forecastday[index].astro.moon_phase === "Full Moon"
      ) {
        moonPoints = 0;
      } else {
        moonPoints = 2;
      }

      const temperatureCoefficient = 2;
      const pressureCoefficient = 1.5;
      const rainCoefficient = 1;
      const moonPhaseCoefficient = 0.8;

      const totalPoints =
        temperaturePoints * temperatureCoefficient +
        pressurePoints * pressureCoefficient +
        rainPoints * rainCoefficient +
        moonPoints * moonPhaseCoefficient;

      if (totalPoints > 0 && totalPoints <= 6) {
        pointsMessage = "Brania złe";
        iconColor = "tomato";
      } else if (totalPoints > 6 && totalPoints <= 14) {
        pointsMessage = "Brania średnie";
        iconColor = "orange";
      } else if (totalPoints > 14 && totalPoints <= 23) {
        pointsMessage = "Brania dobre";
        iconColor = "darkcyan";
      } else if (totalPoints > 23) {
        pointsMessage = "Brania wyśmienite";
        iconColor = "limegreen";
      }

      return {
        date: data.date,
        pointsMessage: pointsMessage,
        iconColor: iconColor,
      };
    });

    setDayPoints(newDayPoints);
  };
  useEffect(() => {
    if (weather.forecast) {
      calculatePressureDifference();
    }
  }, [weather.forecast]);

  useEffect(() => {
    if (pressureData.length > 0) {
      calculateDay();
    }
  }, [pressureData, weather.forecast]);

  const formatDate = (inputDate) => {
    const options = { day: "numeric", month: "numeric" };
    const date = new Date(inputDate);
    return date.toLocaleDateString(undefined, options);
  };

  return (
    <div className="strikeCallendar">
      {weather.forecast && (
        <div className="table-callendar">
          <div className=" title rounded-t-md bg-[#fff] font-bold text-black">
            Kalendarz Brań
          </div>
          <div className="legend">
            <div className="legend-description">
              <p>Wyśmienite</p>
              <FishIcon height={48} width={48} iconColor={"limegreen"} />
            </div>
            <div className="legend-description">
              <p>Dobre</p>
              <FishIcon height={48} width={48} iconColor={"darkcyan"} />
            </div>
            <div className="legend-description">
              <p>Średnie</p>
              <FishIcon height={48} width={48} iconColor={"orange"} />
            </div>
            <div className="legend-description">
              <p>Złe</p>
              <FishIcon height={48} width={48} iconColor={"tomato"} />
            </div>
          </div>
          <div className="table-head">
            <div className="row-head">Dzień</div>
            <div className="row-head">Brania</div>
          </div>
          {dayPoints.map((day, index) => (
            <div
              key={day.date}
              className={`flex ${index % 2 === 0 ? "even-day" : "odd-day"} ${
                index === dayPoints.length - 1 ? "rounded-b-md" : ""
              }`}>
              <div className={`w-1/2 border-r-2 py-3 text-black`}>
                {formatDate(day.date)}
              </div>
              <div className={"fishIcon"}>
                <FishIcon height={48} width={48} iconColor={day.iconColor} />
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="callendar-info">
        <p> Zobacz jak działa nasz kalendarz brań </p>
        <button
          aria-label="Open info modal"
          onClick={setIsOpenPopup.bind(this, true)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="icon icon-tabler icon-tabler-info-circle self-center"
            width={20}
            height={20}
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
            <path d="M12 9h.01" />
            <path d="M11 12h1v4h1" />
          </svg>
        </button>
        {isOpenPopup && <Popup setIsOpenPopup={setIsOpenPopup} />}
      </div>
    </div>
  );
};

export default StrikeCallendar;
