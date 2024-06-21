<script setup lang="ts">
import { useForecast } from "~/composables/forecast";

const { getValue, getIcon, getUnit, data } = useForecast();
</script>

<template>
	<div v-if="data">
		<v-card variant="text">
			<v-card-text>
				<v-row>
					<v-col cols="6">
						<v-row no-gutters class="d-flex flex-column">
							<v-col>
								<ForecastWIlvu
									:label="'Cloud Cover'"
									:icon="getIcon('Cloud Cover')"
									:value="getValue('Cloud Cover')"
									:unit="getUnit('Cloud Cover')"
								>
								</ForecastWIlvu>
							</v-col>
							<v-col>
								<ForecastWIlvu
									:label="'Wind Speed'"
									:icon="getIcon('Wind Speed')"
									:value="getValue('Wind Speed')"
									:unit="getUnit('Wind Speed')"
								>
								</ForecastWIlvu>
							</v-col>
							<v-col>
								<ForecastWIlvu
									:label="'Surface Pressure'"
									:icon="getIcon('Surface Pressure')"
									:value="getValue('Surface Pressure')"
									:unit="getUnit('Surface Pressure')"
								>
								</ForecastWIlvu>
							</v-col>
							<v-col>
								<ForecastWIlvu
									:icon="getIcon('Wind Gusts')"
									:value="getValue('Wind Gusts')"
									:unit="getUnit('Wind Gusts')"
									:label="'Wind Gusts'"
								>
								</ForecastWIlvu>
							</v-col>
						</v-row>
					</v-col>
					<v-col cols="6">
						<v-row no-gutters class="d-flex flex-column">
							<v-col>
								<ForecastWIlvu
									:label="'Precipitation'"
									:value="getValue('Precipitation')"
									:icon="getIcon('Precipitation')"
									:unit="getUnit('Precipitation')"
								>
								</ForecastWIlvu>
							</v-col>
							<v-col>
								<ForecastWIlvu
									:label="'Rain'"
									:value="getValue('Rain')"
									:icon="getIcon('Rain')"
									:unit="getUnit('Rain')"
								>
								</ForecastWIlvu>
							</v-col>
							<v-col>
								<ForecastWIlvu
									:label="'Showers'"
									:value="getValue('Showers')"
									:icon="getIcon('Showers')"
									:unit="getUnit('Showers')"
								>
								</ForecastWIlvu>
							</v-col>
							<v-col>
								<ForecastWIlvu
									:label="'Snowfall'"
									:value="getValue('Snowfall')"
									:icon="getIcon('Snowfall')"
									:unit="getUnit('Snowfall')"
								>
								</ForecastWIlvu>
							</v-col>
						</v-row>
					</v-col>
				</v-row>
				<v-row>
					<v-col cols="6">
						<v-row no-gutters class="d-flex flex-column">
							<v-col>
								<ForecastWIlvu
									:icon="getIcon('Relative Humidity')"
									:label="'Humidity'"
									:value="getValue('Relative Humidity')"
									:unit="getUnit('Relative Humidity')"
								>
								</ForecastWIlvu>
							</v-col>
						</v-row>
					</v-col>
					<v-col cols="6">
						<v-row no-gutters class="d-flex flex-column"> </v-row>
					</v-col>
				</v-row>
			</v-card-text>
		</v-card>
	</div>
</template>

<style scoped></style>
