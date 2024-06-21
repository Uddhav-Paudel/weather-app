import { storeToRefs } from "pinia";
import { useSettingStore } from "~/stores/setting";

export const useSetting = ()=>{
  const settingStore = useSettingStore();
  const { temperature_unit, themeSetting, tabs, innerTabs } = storeToRefs(settingStore);
  const forecastStore = useForecastStore();
  const {latitude, longitude} = storeToRefs(forecastStore);

  const toggleTheme = ()=>{
    settingStore.toggleTheme();
  }

  const getCurrentLocation = ()=>{
    if(navigator){
      navigator.geolocation.getCurrentPosition((pos)=>{
        latitude.value = pos.coords.latitude;
        longitude.value = pos.coords.longitude;
        tabs.value = 'forecast';
      });
    }
  }
  
  const toggeleUnit = () =>{
    forecastStore.refresh();
  }
  return { temperature_unit, 
    themeSetting, 
    toggleTheme, 
    toggeleUnit, 
    tabs, 
    innerTabs, 
    getCurrentLocation
  };
}