import { useEffect, useState } from "react";
import Select from "react-select";

const Home = () => {
  const api_Key = process.env.REACT_APP_WEATHER_API_KEY;

  const [weather, setWeather] = useState([]);
  const [pressureData, setPressureData] = useState([]);
  const [dayPoints, setDayPoints] = useState([]);
  const [city, setCity] = useState("Warszawa");
  const [displayCity, setDisplayCity] = useState("Warszawa");

  const cityList = [
    { value: "Bialystok", label: "Białystok" },
    { value: "Bydgoszcz", label: "Bydgoszcz" },
    { value: "Gdańsk", label: "Gdańsk" },
    { value: "Gorzów_Wielkopolski", label: "Gorzów Wielkopolski" },
    { value: "Katowice", label: "Katowice" },
    { value: "Kielce", label: "Kielce" },
    { value: "Cracow", label: "Kraków" }, //ó
    { value: "Lublin", label: "Lublin" },
    { value: "Lodz", label: "Łódź" },
    { value: "Olsztyn", label: "Olsztyn" },
    { value: "Opole", label: "Opole" },
    { value: "Poznan", label: "Poznań" },
    { value: "Rzeszów", label: "Rzeszów" },
    { value: "Szczecin", label: "Szczecin" },
    { value: "Warszawa", label: "Warszawa" },
    { value: "Wroclaw", label: "Wrocław" }, //ł
    { value: "Zielona_Góra", label: "Zielona Góra" },
  ];

  const fetchWeather = async () => {
    try {
      const response = await fetch(
        `http://api.weatherapi.com/v1/forecast.json?key=${api_Key}&q=${city}&days=5`,
      );
      const data = await response.json();
      setWeather(data);
    } catch (error) {
      console.error("Error fetching weather data:", error);
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

      if (
        weather.forecast.forecastday[index].day.avgtemp_c > 0 &&
        weather.forecast.forecastday[index].day.avgtemp_c < 30
      ) {
        temperaturePoints = 5;
      } else {
        temperaturePoints = 0;
      }

      if (data.pressureDifference > 10) {
        pressurePoints = 0;
      } else {
        pressurePoints = 5;
      }

      if (weather.forecast.forecastday[index].day.daily_chance_of_rain > 50) {
        rainPoints = 1;
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

      const totalPoints =
        temperaturePoints + pressurePoints + moonPoints + rainPoints;

      return {
        date: data.date,
        points: totalPoints,
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

  const handleVoivodeship = (data) => {
    setCity(data.value);
    setDisplayCity(data.label);
  };

  return (
    <>
      <div>
        <h1>HOME</h1>
        {weather.forecast && (
          <div>
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
              <table className="ml-20 border-2 border-solid border-black">
                <tbody>
                  <tr className="border-2 border-solid border-black">
                    <th className="border-2 border-solid border-black p-3">
                      Dzień
                    </th>
                    <th>Brania</th>
                  </tr>
                  {dayPoints.map((day) => (
                    <tr
                      key={day.date}
                      className="border-2 border-solid border-black ">
                      <td className="border-2 border-solid border-black p-3">
                        Data: {day.date}
                      </td>
                      <td className="p-3">Punkty : {day.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
