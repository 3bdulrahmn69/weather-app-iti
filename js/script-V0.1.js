window.addEventListener('DOMContentLoaded', () => {
  // APP Variables
  let tempUnit = 'C';
  let feelsLikeCelsius = null;

  // API Variables
  const baseUrl = 'https://api.openweathermap.org/data/2.5';
  const apiKey = 'cdc859814f20d949846390ac59a33a87';
  let city = 'Cairo';

  // weatherapi.com
  let weatherApiKey = '7c3880c7508e4fd4a25175621253004';

  // Helper functions
  const formatTime = (unixTime) => {
    const date = new Date(unixTime * 1000);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');

    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;

    return `${hour12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

  const formatPrettyDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();

    // Get ordinal suffix
    const getOrdinal = (n) => {
      if (n >= 11 && n <= 13) return n + 'th';
      switch (n % 10) {
        case 1:
          return n + 'st';
        case 2:
          return n + 'nd';
        case 3:
          return n + 'rd';
        default:
          return n + 'th';
      }
    };

    const month = date.toLocaleString('en-US', { month: 'long' });

    return `${getOrdinal(day)} ${month}`;
  };

  const updateFeelsLikeDisplay = () => {
    const value =
      tempUnit === 'C' ? feelsLikeCelsius : (feelsLikeCelsius * 9) / 5 + 32; // convert to Fahrenheit
    document.querySelector('.fells-like').textContent = value.toFixed(1) + '°';
  };

  const createTodayForecastBox = (hour, tempC, tempF, icon) => {
    //   <div class="forecast-item">
    //   <p>10:00</p>
    //   <img src="assets/images/Night-snowy.svg" alt="at">
    //   <p>50°</p>
    // </div>
    const forecastBox = document.createElement('div');
    forecastBox.className = 'forecast-item';

    const time = document.createElement('p');
    time.textContent = hour;
    forecastBox.appendChild(time);

    const weatherIcon = document.createElement('img');
    weatherIcon.src = icon;
    weatherIcon.alt = 'at';
    forecastBox.appendChild(weatherIcon);

    const temperature = document.createElement('p');
    temperature.dataset.celsius = tempC;
    temperature.dataset.fahrenheit = tempF;
    temperature.textContent = tempUnit === 'C' ? tempC + '°' : tempF + '°';
    forecastBox.appendChild(temperature);

    document
      .querySelector('.today-forecast-container')
      .appendChild(forecastBox);
  };

  const createForecastBox = (
    date,
    day,
    icon,
    des,
    maxTemp_c,
    maxTemp_f,
    minTemp_c,
    minTemp_f
  ) => {
    //  <div class="day">
    //         <div class="right">
    //           <p>3ed Fab</p>
    //           <p>Saturday</p>
    //         </div>
    //         <div class="mid">
    //           <img src="assets/images/Night-snowy.svg" alt="new">
    //           <p>Partly Cloud</p>
    //         </div>
    //         <div class="left">
    //           <p>53.6°/32°</p>
    //         </div>
    // </div>

    const forecastBox = document.createElement('div');
    forecastBox.className = 'day';
    const right = document.createElement('div');
    right.className = 'right';

    const dateElement = document.createElement('p');
    dateElement.textContent = date;
    right.appendChild(dateElement);
    const dayElement = document.createElement('p');
    dayElement.textContent = day;
    right.appendChild(dayElement);
    forecastBox.appendChild(right);

    const mid = document.createElement('div');
    mid.className = 'mid';
    const weatherIcon = document.createElement('img');
    weatherIcon.src = icon;
    weatherIcon.alt = 'new';
    mid.appendChild(weatherIcon);
    const description = document.createElement('p');
    description.textContent = des;
    mid.appendChild(description);
    forecastBox.appendChild(mid);

    const left = document.createElement('div');
    left.className = 'left';
    const temperature = document.createElement('p');
    temperature.dataset.celsius = `${maxTemp_c}°/${minTemp_c}°`;
    temperature.dataset.fahrenheit = `${maxTemp_f}°/${minTemp_f}°`;
    temperature.textContent =
      tempUnit === 'C'
        ? `${maxTemp_c}°/${minTemp_c}°`
        : `${maxTemp_f}°/${minTemp_f}°`;
    left.appendChild(temperature);
    forecastBox.appendChild(left);

    document
      .querySelector('.days7-forecast-container')
      .appendChild(forecastBox);
  };

  // _____________________________________________________________________________

  const updateWeatherDetails = () => {
    let data = new XMLHttpRequest();
    data.open(
      'GET',
      `${baseUrl}/weather?q=${city}&units=metric&appid=${apiKey}`,
      true
    );

    data.onload = function () {
      if (this.status === 200) {
        const response = JSON.parse(this.responseText);

        feelsLikeCelsius = response.main.feels_like;

        document.getElementById('sunrise').textContent = formatTime(
          response.sys.sunrise
        );
        document.getElementById('sunset').textContent = formatTime(
          response.sys.sunset
        );
        document.getElementById('chance-of-rain').textContent =
          response.clouds.all + '%';
        document.getElementById('wind-speed').textContent =
          (response.wind.speed * 3.6).toFixed(1) + ' Km/h';
        document.getElementById('uv-index').textContent = 'N/A';
        updateFeelsLikeDisplay();
      } else {
        console.error('Failed to fetch weather data:', this.status);
      }
    };

    data.send();
  };

  const updateTodayForecast = () => {
    let data = new XMLHttpRequest();
    data.open(
      'GET',
      `http://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${city}&days=1&aqi=no&alerts=no`,
      true
    );

    data.onload = function () {
      if (this.status === 200) {
        const response = JSON.parse(this.responseText);
        const forecasts = response.forecast.forecastday[0].hour;
        forecasts.forEach((forecast) => {
          const hour = formatTime(forecast.time_epoch);
          const tempC = forecast.temp_c;
          const tempF = forecast.temp_f;
          const icon = forecast.condition.icon;
          createTodayForecastBox(hour, tempC, tempF, icon);
        });
      } else {
        console.error('Failed to fetch weather data:', this.status);
      }
    };

    data.send();
  };

  const update7DaysForecast = () => {
    let data = new XMLHttpRequest();
    data.open(
      'GET',
      `http://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=cairo&days=8`,
      true
    );

    data.onload = function () {
      if (this.status === 200) {
        const response = JSON.parse(this.responseText);
        const forecasts = response.forecast.forecastday.slice(1);
        forecasts.forEach((forecast) => {
          const date = formatPrettyDate(forecast.date);
          const day = new Date(forecast.date).toLocaleDateString('en-US', {
            weekday: 'long',
          });
          const icon = forecast.day.condition.icon;
          const des = forecast.day.condition.text;
          const maxTemp_c = forecast.day.maxtemp_c;
          const maxTemp_f = forecast.day.maxtemp_f;
          const minTemp_c = forecast.day.mintemp_c;
          const minTemp_f = forecast.day.mintemp_f;
          createForecastBox(
            date,
            day,
            icon,
            des,
            maxTemp_c,
            maxTemp_f,
            minTemp_c,
            minTemp_f
          );
        });
      } else {
        console.error('Failed to fetch weather data:', this.status);
      }
    };

    data.send();
  };

  const updateWeatherAndCity = () => {
    let data = new XMLHttpRequest();
    data.open(
      'GET',
      `http://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${city}`,
      true
    );
    data.onload = function () {
      if (this.status === 200) {
        const response = JSON.parse(this.responseText);
        city = response.location.name;
        const date = formatPrettyDate(response.location.localtime);
        const country = response.location.country;
        const icon = response.current.condition.icon;
        const maxTempC = response.current.temp_c;
        const maxTempF = response.current.temp_f;
        const minTempC = response.current.temp_c;
        const minTempF = response.current.temp_f;

        document.getElementById('date').textContent = date;
        document.getElementById('city').textContent = city;
        document.getElementById('country').textContent = country;
        document.getElementById('temperature').textContent =
          tempUnit === 'C'
            ? `${maxTempC}°/${minTempC}°`
            : `${maxTempF}°/${minTempF}°`;
        document.querySelector('.weather-icon img').src = icon;
      } else {
        console.error('Failed to fetch weather data:', this.status);
      }
    };

    updateWeatherDetails();
    updateTodayForecast();
    update7DaysForecast();
  };

  // toggle between Celsius and Fahrenheit
  document.getElementById('temp-toggle').addEventListener('change', () => {
    tempUnit = document.getElementById('temp-toggle').checked ? 'C' : 'F';
    updateFeelsLikeDisplay();

    document.querySelectorAll('.forecast-temp').forEach((el) => {
      const temp =
        tempUnit === 'C' ? el.dataset.celsius : el.dataset.fahrenheit;
      el.textContent = `${parseFloat(temp).toFixed(1)}°`;
    });

    document
      .querySelectorAll('.today-forecast-container .forecast-item p')
      .forEach((el) => {
        const temp =
          tempUnit === 'C' ? el.dataset.celsius : el.dataset.fahrenheit;
        el.textContent = `${parseFloat(temp).toFixed(1)}°`;
      });
  });

  // search for a city
  document.getElementById('search').addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      city = document.getElementById('search').value;
      document.querySelector('.today-forecast-container').innerHTML = '';
      document.querySelector('.days7-forecast-container').innerHTML = '';

      updateWeatherAndCity();
      document.getElementById('search').value = '';
    }
  });
});
