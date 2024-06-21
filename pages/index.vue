<script setup lang="ts">
const { latitude, longitude, refresh } = useForecast();
const { tabs } = useSetting();
if (navigator) {
	navigator.geolocation.getCurrentPosition((pos) => {
		latitude.value = pos.coords.latitude;
		longitude.value = pos.coords.longitude;
		refresh();
		tabs.value = "forecast";
	});
}
</script>

<template>
	<div>
		<v-container>
			<v-tabs-window v-model="tabs">
				<v-tabs-window-item value="location">
					<LocationWLocation></LocationWLocation>
				</v-tabs-window-item>
				<v-tabs-window-item value="forecast">
					<ForecastWForecast></ForecastWForecast>
				</v-tabs-window-item>
				<v-tabs-window-item value="settings">
					<SettingWSetting></SettingWSetting>
				</v-tabs-window-item>
			</v-tabs-window>
		</v-container>
	</div>
</template>

<style scoped></style>
