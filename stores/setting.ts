import { defineStore } from "pinia";
import { useTheme } from 'vuetify';

export const useSettingStore = defineStore('setting', ()=>{
    const temperature_unit = ref<string>('celsius');
    const themeSetting = ref<any>('dark');
    const tabs = ref<any>();
    const innerTabs = ref<any>();
    const theme = useTheme();
    const toggleTheme =()=>{
        theme.global.name.value = themeSetting.value;
    }
    return { temperature_unit, themeSetting, toggleTheme, tabs, innerTabs };
});