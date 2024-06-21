import { defineStore } from "pinia";
import { getCountryCode, type TCountryCode } from 'countries-list';

export const useLocationStore = defineStore('location-store', ()=>{
    const forecastStore = useForecastStore();
    const {latitude, longitude} = storeToRefs(forecastStore);
    const selectedAddress = ref<string>();
    const countryCode = ref<any>();
    
    const cityOrState = ref<string>('');
    const apiUrl = ref<string>('https://nominatim.openstreetmap.org/search.php?q=');
    const {data, status,error:err, refresh} = useFetch(()=>`${apiUrl.value}${cityOrState.value}&polygon_geojson=1&format=jsonv2`,{
        immediate: false,
        watch:false
    });

    const setAddressDetail = (selectedItemObject:any)=>{
        let selectedItemValue = selectedItemObject["display_name"];
        selectedAddress.value = selectedItemValue;
        let sArr = selectedItemValue.split(',');
        let countryName = sArr[sArr.length-1];
        countryCode.value = getCountryCode(countryName.trim());
        latitude.value = selectedItemObject['lat'];
        longitude.value = selectedItemObject['lon'];
    }

    return { selectedAddress, latitude, longitude, countryCode, cityOrState, data, status, err,setAddressDetail, refresh};
})