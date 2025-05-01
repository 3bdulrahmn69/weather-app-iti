window.addEventListener('DOMContentLoaded', () => {
  // APP Variables
  let tempUnit = 'C';

  // API Variables
  const weatherApiKey = '7c3880c7508e4fd4a25175621253004';
  const baseUrl = `https://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}`;
  3;

  // Helper functions
  const formatPrettyDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();

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

    const ordinalDay = getOrdinal(day);
    const month = date.toLocaleString('en-US', { month: 'short' });
    const weekday = date.toLocaleString('en-US', { weekday: 'long' });

    return `${ordinalDay} ${month}, ${weekday}`;
  };

  const createHourlyForecastBox = (hour, tempC, tempF, icon, tempUnit) => {
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
    temperature.dataset.celsius = `${tempC}°`;
    temperature.dataset.fahrenheit = `${tempF}°`;
    temperature.textContent = tempUnit === 'C' ? `${tempC}°` : `${tempF}°`;
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
    minTemp_f,
    tempUnit
  ) => {
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

    const mid = document.createElement('div');
    mid.className = 'mid';
    const weatherIcon = document.createElement('img');
    weatherIcon.src = icon;
    weatherIcon.alt = 'new';
    mid.appendChild(weatherIcon);
    const description = document.createElement('p');
    description.textContent = des;
    mid.appendChild(description);

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

    forecastBox.append(right, mid, left);
    document
      .querySelector('.days7-forecast-container')
      .appendChild(forecastBox);
  };

  const createRecentItem = (city) => {
    //   <div class="recent-item">
    //   <div class="recent-info">
    //     <img src="//cdn.weatherapi.com/weather/64x64/day/113.png" alt="#" class="recent-icon"
    //       aria-hidden="true">
    //     <p>Temp</p>
    //     <div>
    //       <p>City</p>
    //       <p>Country</p>
    //     </div>
    //   </div>
    //   <button class="delete-btn" aria-label="Delete recent search">
    //     <img src="assets/icons/material-symbols_delete-outline.svg" alt="Delete icon">
    //   </button>
    // </div>
    const recentItem = document.createElement('div');
    recentItem.className = 'recent-item';

    const recentInfo = document.createElement('div');
    recentInfo.className = 'recent-info';

    const weatherIcon = document.createElement('img');
    weatherIcon.src = city.icon;
    weatherIcon.alt = 'weather icon';
    weatherIcon.className = 'recent-icon';
    weatherIcon.setAttribute('aria-hidden', 'true');
    recentInfo.appendChild(weatherIcon);

    const tempElement = document.createElement('p');
    tempElement.dataset.celsius = `${city.temp.celsius}°`;
    tempElement.dataset.fahrenheit = `${city.temp.fahrenheit}°`;
    tempElement.textContent =
      tempUnit === 'C' ? `${city.temp.celsius}°` : `${city.temp.fahrenheit}°`;
    recentInfo.appendChild(tempElement);

    const cityInfo = document.createElement('div');
    const cityElement = document.createElement('p');
    cityElement.textContent = city.name;
    cityElement.classList.add('recent-city-name');
    cityInfo.appendChild(cityElement);
    const countryElement = document.createElement('p');
    countryElement.textContent = city.country;
    countryElement.classList.add('recent-country-name');
    cityInfo.appendChild(countryElement);
    recentInfo.appendChild(cityInfo);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.setAttribute('aria-label', 'Delete recent search');

    const deleteIcon = document.createElement('img');
    deleteIcon.src = 'assets/icons/material-symbols_delete-outline.svg';
    deleteIcon.alt = 'Delete icon';
    deleteBtn.appendChild(deleteIcon);

    recentItem.append(recentInfo, deleteBtn);
    document.getElementById('recent-list').appendChild(recentItem);
  };

  const saveRecentSearch = (weatherData) => {
    const recentSearches = JSON.parse(
      localStorage.getItem('recentSearches') || '[]'
    );
    const city = {
      icon: weatherData.current.condition.icon,
      name: weatherData.location.name,
      country: weatherData.location.country,
      temp: {
        celsius: weatherData.current.temp_c,
        fahrenheit: weatherData.current.temp_f,
      },
    };

    if (!recentSearches.some((item) => item.name === city.name)) {
      recentSearches.push(city);
      localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    }
  };

  const loadRecentSearches = () => {
    const recentSearches = JSON.parse(
      localStorage.getItem('recentSearches') || '[]'
    );

    return recentSearches;
  };

  const openCLoseRecent = (option) => {
    const recent = document.querySelector('.recent');
    if (option === 'open') {
      recent.classList.remove('hidden');
    } else if (option === 'close') {
      recent.classList.add('hidden');
    }
  };

  // Initial Data Fetch

  const updateTodayWeather = (weatherData) => {
    document.getElementById('date').textContent = formatPrettyDate(
      weatherData.location.localtime
    );
    document.getElementById(
      'city'
    ).textContent = `${weatherData.location.name},`;
    document.getElementById('country').textContent =
      weatherData.location.country;

    const tempElement = document.getElementById('temperature');
    const dayData = weatherData.forecast.forecastday[0].day;
    tempElement.dataset.celsius = `${dayData.maxtemp_c}°/${dayData.mintemp_c}°`;
    tempElement.dataset.fahrenheit = `${dayData.maxtemp_f}°/${dayData.mintemp_f}°`;
    tempElement.textContent =
      tempUnit === 'C'
        ? tempElement.dataset.celsius
        : tempElement.dataset.fahrenheit;

    document.querySelector('.weather-icon img').src =
      weatherData.current.condition.icon;
    document.querySelector('.weather-icon img').alt =
      weatherData.current.condition.text;
  };

  const updateHourlyForecast = (weatherData) => {
    const container = document.querySelector('.today-forecast-container');
    container.innerHTML = ''; // Clear previous forecast
    weatherData.forecast.forecastday[0].hour.forEach((hourData) => {
      const hour = new Date(hourData.time).getHours() + ':00';
      createHourlyForecastBox(
        hour,
        hourData.temp_c,
        hourData.temp_f,
        hourData.condition.icon,
        tempUnit
      );
    });
  };

  const updateWeatherDetails = (weatherData) => {
    const data = weatherData.forecast.forecastday[0];
    document.getElementById('sunrise').textContent = data.astro.sunrise;
    document.getElementById('sunset').textContent = data.astro.sunset;
    document.getElementById(
      'chance-of-rain'
    ).textContent = `${data.day.daily_chance_of_rain}%`;
    document.getElementById(
      'wind-speed'
    ).textContent = `${data.day.maxwind_kph} km/h`;
    document.getElementById('uv-index').textContent = `${data.day.uv}`;

    const feelsLikeElement = document.getElementById('fells-like');
    feelsLikeElement.dataset.celsius = `${data.day.avgtemp_c}°`;
    feelsLikeElement.dataset.fahrenheit = `${data.day.avgtemp_f}°`;
    feelsLikeElement.textContent =
      tempUnit === 'C'
        ? feelsLikeElement.dataset.celsius
        : feelsLikeElement.dataset.fahrenheit;
  };

  const updateWeaklyForecast = (weatherData) => {
    const container = document.querySelector('.days7-forecast-container');
    container.innerHTML = ''; // Clear previous forecast
    weatherData.forecast.forecastday.slice(1).forEach((dayData) => {
      const date = formatPrettyDate(dayData.date).split(',')[0];
      const day = new Date(dayData.date).toLocaleString('en-US', {
        weekday: 'long',
      });
      createForecastBox(
        date,
        day,
        dayData.day.condition.icon,
        dayData.day.condition.text,
        dayData.day.maxtemp_c,
        dayData.day.maxtemp_f,
        dayData.day.mintemp_c,
        dayData.day.mintemp_f,
        tempUnit
      );
    });
  };

  const getWeatherData = (city) => {
    // Get all main sections
    const welcome = document.querySelector('.welcome-message');
    const loading = document.querySelector('.loading-message');
    const mainContent = document.querySelector('.main-content');
    const error = document.querySelector('.error-message');

    // Show loading state
    welcome.classList.add('hidden');
    error.classList.add('hidden');
    mainContent.classList.add('hidden');
    loading.classList.remove('hidden');
    openCLoseRecent('close');

    let data = new XMLHttpRequest();
    data.open('GET', `${baseUrl}&q=${city}&days=8`, true);

    data.onload = function () {
      if (this.status === 200) {
        const weatherData = JSON.parse(this.responseText);

        // Update all UI components
        saveRecentSearch(weatherData);
        updateTodayWeather(weatherData);
        updateHourlyForecast(weatherData);
        updateWeatherDetails(weatherData);
        updateWeaklyForecast(weatherData);

        // Show main content
        loading.classList.add('hidden');
        mainContent.classList.remove('hidden');
      } else {
        console.error(this.status);
        // Show error state
        loading.classList.add('hidden');
        error.classList.remove('hidden');
      }
    };

    data.onerror = function () {
      // Handle network errors
      console.error('Network error');
      loading.classList.add('hidden');
      error.classList.remove('hidden');
    };

    data.send();
  };

  const updateAllTemperatures = () => {
    // Update main temperature
    const mainTemp = document.getElementById('temperature');
    if (mainTemp) {
      mainTemp.textContent =
        tempUnit === 'C'
          ? mainTemp.dataset.celsius
          : mainTemp.dataset.fahrenheit;
    }

    // Update "feels like" temperature
    const feelsLike = document.getElementById('fells-like');
    if (feelsLike) {
      feelsLike.textContent =
        tempUnit === 'C'
          ? feelsLike.dataset.celsius
          : feelsLike.dataset.fahrenheit;
    }

    // Update hourly temperatures
    document.querySelectorAll('.forecast-item p:last-child').forEach((temp) => {
      temp.textContent =
        tempUnit === 'C' ? temp.dataset.celsius : temp.dataset.fahrenheit;
    });

    // Update weekly forecast temperatures
    document.querySelectorAll('.day .left p').forEach((temp) => {
      temp.textContent =
        tempUnit === 'C' ? temp.dataset.celsius : temp.dataset.fahrenheit;
    });

    // Update recent items
    document
      .querySelectorAll('.recent-item p[data-celsius]')
      .forEach((temp) => {
        temp.textContent =
          tempUnit === 'C' ? temp.dataset.celsius : temp.dataset.fahrenheit;
      });
  };

  // Event Listeners
  document.getElementById('temp-toggle').addEventListener('change', () => {
    tempUnit = document.getElementById('temp-toggle').checked ? 'C' : 'F';
    updateAllTemperatures();
  });

  let debounceTimer;
  document.getElementById('search').addEventListener('keyup', (e) => {
    clearTimeout(debounceTimer); // Clear previous timer

    const city = e.target.value.trim();

    if (city.length >= 3) {
      debounceTimer = setTimeout(() => {
        getWeatherData(city);
      }, 1000); // 1000ms = 1 second
    }
  });

  document.getElementById('search').addEventListener('focus', () => {
    openCLoseRecent('open');
    const recentSearches = loadRecentSearches();

    if (recentSearches.length > 0) {
      document.getElementById('recent-list').classList.remove('hidden');
      document.getElementById('clear-btn').classList.remove('hidden');
      document.getElementById('no-recent').classList.add('hidden');
      document.getElementById('recent-list').innerHTML = ''; // Clear previous items
      recentSearches.forEach((city) => {
        createRecentItem(city);
      });
    } else {
      document.getElementById('recent-list').classList.add('hidden');
      document.getElementById('clear-btn').classList.add('hidden');
      document.getElementById('no-recent').classList.remove('hidden');
    }
  });

  document.getElementById('recent-list').addEventListener('click', (e) => {
    if (e.target.closest('.delete-btn')) {
      const recentItem = e.target.closest('.recent-item');
      const cityName =
        recentItem.querySelector('.recent-city-name').textContent;
      let recentSearches = loadRecentSearches();
      recentSearches = recentSearches.filter((city) => city.name !== cityName);
      localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
      recentItem.remove();
    } else if (e.target.closest('.recent-item')) {
      const cityName = e.target
        .closest('.recent-item')
        .querySelector('.recent-city-name').textContent;
      getWeatherData(cityName);
      openCLoseRecent('close');
    }
  });

  document.getElementById('clear-btn').addEventListener('click', () => {
    localStorage.removeItem('recentSearches');
    document.getElementById('recent-list').innerHTML = '';
    document.getElementById('recent-list').classList.add('hidden');
    document.getElementById('clear-btn').classList.add('hidden');
    document.getElementById('no-recent').classList.remove('hidden');
    openCLoseRecent('close');
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.recent') && !e.target.closest('#search')) {
      openCLoseRecent('close');
    }
  });
});
