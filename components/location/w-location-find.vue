<script setup lang="ts">
import { useLocation } from "~/composables/location";

const searchedItem = ref<string>("");
const { cityOrState, refresh } = useLocation();
const findLocation = () => {
	cityOrState.value = searchedItem.value;
	refresh();
};
</script>

<template>
	<div>
		<v-card>
			<v-card-title> Find Location </v-card-title>
			<v-card-subtitle>
				<v-text-field
					variant="outlined"
					density="compact"
					v-model="searchedItem"
					@keyup.enter="findLocation"
				>
					<template #append-inner>
						<v-icon icon="mdi-magnify" @click="findLocation"></v-icon>
					</template> </v-text-field
			></v-card-subtitle>
		</v-card>
	</div>
</template>

<style scoped></style>
