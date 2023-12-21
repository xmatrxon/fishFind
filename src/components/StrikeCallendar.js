import { useEffect, useState } from "react";
import FishIcon from "./FishIcon";

const StrikeCallendar = ({ lat, lon, city }) => {
  const api_Key = process.env.REACT_APP_WEATHER_API_KEY;

  const [weather, setWeather] = useState([]);
  const [pressureData, setPressureData] = useState([]);
  const [dayPoints, setDayPoints] = useState([]);

  const fetchWeather = async () => {
    if (city) {
      try {
        const response = await fetch(
          `http://api.weatherapi.com/v1/forecast.json?key=${api_Key}&q=${city}&days=5`,
        );
        const data = await response.json();
        setWeather(data);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    } else {
      try {
        const response = await fetch(
          `http://api.weatherapi.com/v1/forecast.json?key=${api_Key}&q=${lat},${lon}&days=5`,
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
    <>
      <div>
        {weather.forecast && (
          <div className="ml-20 w-[28rem] border-2 border-solid border-black">
            <div className="border-b-2 border-solid border-black bg-[#00CED1] p-3 font-bold">
              Kalendarz Brań
            </div>
            <div className="flex w-full justify-around bg-[#00ced165] p-3">
              <div className=" flex w-24 flex-col">
                <p>Wyśmienite</p>
                <FishIcon height={48} width={48} iconColor={"limegreen"} />
              </div>
              <div className="flex w-24 flex-col">
                <p>Dobre</p>
                <FishIcon height={48} width={48} iconColor={"darkcyan"} />
              </div>
              <div className="flex w-24 flex-col">
                <p>Średnie</p>
                <FishIcon height={48} width={48} iconColor={"orange"} />
              </div>
              <div className="flex w-24 flex-col">
                <p>Złe</p>
                <FishIcon height={48} width={48} iconColor={"tomato"} />
              </div>
            </div>
            <div className="flex border-t-2 border-solid border-black ">
              <div className="w-1/2 border-r-2 border-solid border-black bg-[#CDCDCD] py-3 font-bold">
                Dzień
              </div>
              <div className="w-1/2 bg-[#CDCDCD] py-3 font-bold">Brania</div>
            </div>
            {dayPoints.map((day) => (
              <div
                key={day.date}
                className="flex border-t-2 border-solid border-black">
                <div className="w-1/2 border-r-2 border-solid border-black py-3">
                  {formatDate(day.date)}
                </div>
                <div className="flex w-1/2 justify-center py-3">
                  <FishIcon height={48} width={48} iconColor={day.iconColor} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default StrikeCallendar;
