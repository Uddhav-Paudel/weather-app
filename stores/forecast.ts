import { defineStore } from "pinia";

export const useForecastStore = defineStore('forecaststore',()=>{
    const settingStore = useSettingStore();
    const latitude = ref<number>(35.789);
    const longitude = ref<number>(36.678);
    const { temperature_unit } = storeToRefs(settingStore);
    const weatherParam = ref<any>();
    interface objectDataInterface {
        current: any;
        daily: any;
        current_units:any;
        daily_units:any;
        timezone:string,
        timezone_abbreviation:string
    }
    weatherParam.value = {
        "latitude":`${latitude.value}`,
        "longitude":`${longitude.value}`,
        "temperature_unit": temperature_unit.value,
        "current": ["temperature_2m", "relative_humidity_2m", "apparent_temperature", "is_day", "precipitation", "rain", "showers", "snowfall", "weather_code", "cloud_cover", "pressure_msl", "surface_pressure", "wind_speed_10m", "wind_direction_10m", "wind_gusts_10m"],
        "daily": ["weather_code", "temperature_2m_max", "temperature_2m_min", "apparent_temperature_max", "apparent_temperature_min", "sunrise", "sunset", "daylight_duration", "sunshine_duration", "uv_index_max", "precipitation_sum", "rain_sum", "showers_sum", "snowfall_sum", "wind_speed_10m_max", "wind_gusts_10m_max"]
    }
    const apiUrl = ref<string>('https://api.open-meteo.com/v1/forecast');
    const {data, error:err, status, refresh} = useFetch<objectDataInterface>(()=>{
        return apiUrl.value
    }, {
        params:{
            latitude,
            longitude,
            temperature_unit,
            daily:weatherParam.value.daily,
            current:weatherParam.value.current
        },
        immediate: false,
        watch:false,
    });
   

    const setWeatherParam = ()=>{
        weatherParam.value = {
            "latitude":latitude.value,
            "longitude":longitude.value,
            "temperature_unit": temperature_unit.value,
            "current": ["temperature_2m", "relative_humidity_2m", "apparent_temperature", "is_day", "precipitation", "rain", "showers", "snowfall", "weather_code", "cloud_cover", "pressure_msl", "surface_pressure", "wind_speed_10m", "wind_gusts_10m"],
	        "daily": ["weather_code", "temperature_2m_max", "temperature_2m_min", "apparent_temperature_max", "apparent_temperature_min", "sunrise", "sunset", "daylight_duration", "sunshine_duration", "uv_index_max", "precipitation_sum", "rain_sum", "showers_sum", "snowfall_sum", "wind_speed_10m_max", "wind_gusts_10m_max"]
        }
        console.log(weatherParam.value);
    }

    return {data, latitude, longitude,temperature_unit, err, status,setWeatherParam, refresh};
});