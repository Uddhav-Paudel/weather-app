<script setup lang="ts">
import { useSetting } from "~/composables/setting";

const { themeSetting, temperature_unit, toggleTheme, toggeleUnit } =
	useSetting();
</script>

<template>
	<div class="d-flex flex-column align-center">
		<v-card class="d-flex flex-column align-center" variant="text">
			<template #prepend>
				<v-icon icon="mdi-cloud"></v-icon>
			</template>
			<v-card-title> Weather App </v-card-title>
			<v-card-subtitle> copyright@uddhav.com </v-card-subtitle>
		</v-card>
		<v-card class="d-flex flex-column align-center" variant="text">
			<v-card-title> App Version </v-card-title>
			<v-card-subtitle> 1.0.0 </v-card-subtitle>
		</v-card>
		<v-card class="d-flex flex-column align-center" variant="text">
			<v-card-title> Unit setting </v-card-title>
			<v-card-subtitle>
				<v-btn-toggle v-model="temperature_unit" @click="toggeleUnit">
					<v-btn value="celsius"> Celsius </v-btn>
					<v-btn value="fahrenheit"> Fahrenheit </v-btn>
				</v-btn-toggle>
			</v-card-subtitle>
		</v-card>
		<v-card class="d-flex flex-column align-center" variant="text">
			<v-card-title> Theme setting </v-card-title>
			<v-card-subtitle>
				<v-btn-toggle v-model="themeSetting" @click="toggleTheme">
					<v-btn value="dark"> Dark </v-btn>
					<v-btn value="light"> Light </v-btn>
				</v-btn-toggle>
			</v-card-subtitle>
		</v-card>
	</div>
</template>

<style scoped></style>
