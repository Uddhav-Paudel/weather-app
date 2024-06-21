export const useForecast = () => {
  const forecaststore = useForecastStore();
  const {data, latitude, longitude,status, temperature_unit, err} = storeToRefs(forecaststore);

  const currentWeatherData = ref<any>(data?.value?.current);
  const currentUnitData = ref<any>(data.value?.current_units);

  watch(data,(newData)=>{
    currentWeatherData.value = newData?.current;
    currentUnitData.value = newData?.current_units;
  })
  const weatherParamJson:any = {
    "Temperature": {
      "variable": "temperature_2m",
      "icon": "mdi-thermometer"
    },
    "Relative Humidity": {
      "variable": "relative_humidity_2m",
      "icon": "mdi-water-percent"
    },
    "Feels Like": {
      "variable": "apparent_temperature",
      "icon": "mdi-thermometer"
    },
    "Precipitation": {
      "variable": "precipitation",
      "icon": "mdi-weather-rainy"
    },
    "Rain": {
      "variable": "rain",
      "icon": "mdi-weather-rainy"
    },
    "Showers": {
      "variable": "showers",
      "icon": "mdi-weather-pouring"
    },
    "Snowfall": {
      "variable": "snowfall",
      "icon": "mdi-weather-snowy"
    },
    "Weather Condition": {
      "variable": "weather_code",
      "icon": "mdi-weather-sunny"
    },
    "Cloud Cover": {
      "variable": "cloud_cover",
      "icon": "mdi-cloud"
    },
    "Sea Level Pressure": {
      "variable": "pressure_msl",
      "icon": "mdi-gauge"
    },
    "Surface Pressure": {
      "variable": "surface_pressure",
      "icon": "mdi-gauge"
    },
    "Wind Speed": {
      "variable": "wind_speed_10m",
      "icon": "mdi-weather-windy"
    },
    "Wind Gusts": {
      "variable": "wind_gusts_10m",
      "icon": "mdi-weather-windy"
    }
  }

  const weatherCodeJson:any = {
    "0": {
      "label": "Clear Sky",
      "icon": "mdi-weather-sunny"
    },
    "1": {
      "label": "Mainly Clear",
      "icon": "mdi-weather-partly-cloudy"
    },
    "2": {
      "label": "Partly Cloudy",
      "icon": "mdi-weather-partly-cloudy"
    },
    "3": {
      "label": "Overcast",
      "icon": "mdi-weather-cloudy"
    },
    "45": {
      "label": "Fog",
      "icon": "mdi-weather-fog"
    },
    "48": {
      "label": "Depositing Rime Fog",
      "icon": "mdi-weather-fog"
    },
    "51": {
      "label": "Light Drizzle",
      "icon": "mdi-weather-rainy"
    },
    "53": {
      "label": "Moderate Drizzle",
      "icon": "mdi-weather-rainy"
    },
    "55": {
      "label": "Dense Drizzle",
      "icon": "mdi-weather-pouring"
    },
    "56": {
      "label": "Light Freezing Drizzle",
      "icon": "mdi-weather-hail"
    },
    "57": {
      "label": "Dense Freezing Drizzle",
      "icon": "mdi-weather-hail"
    },
    "61": {
      "label": "Slight Rain",
      "icon": "mdi-weather-rainy"
    },
    "63": {
      "label": "Moderate Rain",
      "icon": "mdi-weather-pouring"
    },
    "65": {
      "label": "Heavy Rain",
      "icon": "mdi-weather-pouring"
    },
    "66": {
      "label": "Light Freezing Rain",
      "icon": "mdi-weather-hail"
    },
    "67": {
      "label": "Heavy Freezing Rain",
      "icon": "mdi-weather-hail"
    },
    "71": {
      "label": "Slight Snowfall",
      "icon": "mdi-weather-snowy"
    },
    "73": {
      "label": "Moderate Snowfall",
      "icon": "mdi-weather-snowy"
    },
    "75": {
      "label": "Heavy Snowfall",
      "icon": "mdi-weather-snowy"
    },
    "77": {
      "label": "Snow Grains",
      "icon": "mdi-weather-snowy"
    },
    "80": {
      "label": "Slight Rain Showers",
      "icon": "mdi-weather-rainy"
    },
    "81": {
      "label": "Moderate Rain Showers",
      "icon": "mdi-weather-pouring"
    },
    "82": {
      "label": "Violent Rain Showers",
      "icon": "mdi-weather-pouring"
    },
    "85": {
      "label": "Slight Snow Showers",
      "icon": "mdi-weather-snowy"
    },
    "86": {
      "label": "Heavy Snow Showers",
      "icon": "mdi-weather-snowy"
    },
    "95": {
      "label": "Slight Thunderstorm",
      "icon": "mdi-weather-lightning"
    },
    "96": {
      "label": "Thunderstorm with Slight Hail",
      "icon": "mdi-weather-lightning-rainy"
    },
    "99": {
      "label": "Thunderstorm with Heavy Hail",
      "icon": "mdi-weather-lightning-rainy"
    }
  }

  const refresh = ()=>{
    forecaststore.refresh();
  }

  const setWeatherParam = ()=>{
    forecaststore.setWeatherParam();
  }
  

  const getCurrentLocaleDateString = (dateString:any)=>{
    // Create a new Date object
    let date: Date = new Date();
    if(dateString){
      date = new Date(dateString);
    }

    // Define options for the locale string
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,  // Ensures the time is displayed with AM/PM
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };

    // Get the localized date string with AM/PM information
    const localizedDateString: string = date.toLocaleString('en-GB', options);
    return localizedDateString;
  }
  
  const weather_codeParser = (templateName:any)=>{
    let weatherVariable = weatherParamJson[templateName]['variable'];
    let resultValue = weatherVariable;
    if(templateName == 'Weather Condition'){
      resultValue = currentWeatherData.value[weatherVariable];
    }

    return resultValue;
  }

  const getValue =(templateName:string)=>{
    let weatherVariable = weather_codeParser(templateName);
    let resultValue = '';
    if(templateName == 'Weather Condition'){
      resultValue = weatherCodeJson[weatherVariable]['label'];
    }else{
      resultValue = currentWeatherData.value[weatherVariable];
    }

    return resultValue;
  }

  const getIcon = (templateName:string)=>{
    let weatherVariable = weather_codeParser(templateName);
    let resultValue = '';
    if(templateName == 'Weather Condition'){
      resultValue = weatherCodeJson[weatherVariable]['icon'];
    }else{
      resultValue = weatherParamJson[templateName]['icon'];
    }
    return resultValue;
  }

  const getUnit = (templateName:string)=>{
    let weatherVariable = weather_codeParser(templateName);
    let resultValue = '';
    if(templateName == 'Weather Condition'){
      resultValue = weatherCodeJson[weatherVariable]['icon'];
    }else{
      resultValue = currentUnitData.value[weatherVariable];
    }
    return resultValue;
  }

  return {
    latitude, 
    longitude, 
    temperature_unit, 
    err,
    status,
    setWeatherParam, 
    refresh, 
    data,
    getValue,
    getIcon,
    getUnit,
    getCurrentLocaleDateString 
  };
}
