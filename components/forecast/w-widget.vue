<script setup lang="ts">
const { data, getCurrentLocaleDateString, getValue, getIcon, getUnit } =
	useForecast();
</script>

<template>
	<div v-if="data">
		<v-card elevation="0" variant="text">
			<v-card-item>
				<template #prepend>
					<v-icon :icon="getValue('Weather Condition')"> </v-icon>
				</template>
				<v-card-title> Current Weather </v-card-title>
				<v-card-subtitle>
					{{ getCurrentLocaleDateString(data?.current?.time) }}
				</v-card-subtitle>
			</v-card-item>
			<v-card-text class="">
				<v-row no-gutters class="d-flex flex-column align-center">
					<v-col class="d-flex justify-center">
						<v-icon :icon="getIcon('Weather Condition')" size="128"> </v-icon>
					</v-col>
					<v-col class="d-flex justify-center">
						<h1>{{ getValue("Weather Condition") }}</h1>
					</v-col>
					<v-col class="d-flex justify-center">
						<h2>
							<span>
								<strong
									>{{ getValue("Temperature")
									}}<sup>{{ getUnit("Temperature") }}</sup>
								</strong>
								{{ "  " }} Feels like: {{ "  " }}
								<strong
									>{{ getValue("Feels Like")
									}}<sup>{{ getUnit("Feels Like") }}</sup></strong
								>
							</span>
						</h2>
					</v-col>
				</v-row>
			</v-card-text>
		</v-card>
	</div>
</template>

<style scoped></style>
