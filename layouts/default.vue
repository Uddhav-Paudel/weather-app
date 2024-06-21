<script setup lang="ts">
const { tabs } = useSetting();
</script>

<template>
	<div>
		<v-app>
			<v-toolbar
				extended
				prominent
				class="position-sticky top-0 z-1 custom-background"
			>
				<v-toolbar-title> Weather | Forecast </v-toolbar-title>
				<template #extension>
					<v-tabs v-model="tabs" grow>
						<v-tab value="location" :stacked="true" text="Location">
							<template #append>
								<v-icon icon="mdi-map-marker"> </v-icon>
							</template>
						</v-tab>
						<v-tab value="forecast" :stacked="true" text="Forecast">
							<template #append>
								<v-icon icon="mdi-weather-partly-cloudy"> </v-icon>
							</template>
						</v-tab>
						<v-tab value="settings" :stacked="true" text="Setting">
							<template #append>
								<v-icon icon="mdi-cog"> </v-icon>
							</template>
						</v-tab>
					</v-tabs>
				</template>
			</v-toolbar>
			<v-main>
				<NuxtPage></NuxtPage>
			</v-main>
		</v-app>
	</div>
</template>

<style scoped lang="scss">
.z-1 {
	z-index: 1;
}
</style>
