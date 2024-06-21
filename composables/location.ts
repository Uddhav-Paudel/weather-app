export const useLocation = () => {
  const locationStore = useLocationStore();
  const {
    selectedAddress,
    latitude,
    longitude,
    countryCode,
    cityOrState,
    data,
    status, 
    err
  } = storeToRefs(locationStore);
  
  const setAddressDetail = (selectedItemObject:any)=>{
    locationStore.setAddressDetail(selectedItemObject);
  }

  const refresh = ()=>{
    locationStore.refresh();
  }

  return {
    latitude,
    longitude,
    selectedAddress, 
    countryCode, 
    cityOrState, 
    data, 
    status,
    setAddressDetail, 
    refresh,
    err
  };
}
