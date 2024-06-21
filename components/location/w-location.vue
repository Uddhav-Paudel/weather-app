<script setup lang="ts">
import { storeToRefs } from "pinia";
const { selectedAddress, countryCode, getCurrentLocationWeather } =
	useLocation();
</script>

<template>
	<div>
		<v-card>
			<v-card-item class="d-flex flex-column align-center">
				<v-img
					v-if="countryCode"
					:src="`/flags/${countryCode.toLowerCase()}.svg`"
					alt="Country flag"
					height="50px"
					width="auto"
					block
				></v-img>
				<v-card-title> {{ selectedAddress }}</v-card-title>
			</v-card-item>

			<v-card-text>
				<v-btn variant="outlined" block @click="getCurrentLocationWeather">
					Current Location
				</v-btn>
			</v-card-text>
		</v-card>
		<LocationWLocationFind></LocationWLocationFind>
		<LocationWLocationList></LocationWLocationList>
	</div>
</template>

<style scoped></style>
