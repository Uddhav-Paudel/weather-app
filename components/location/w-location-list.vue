<script setup lang="ts">
import { useLocation } from "~/composables/location";

const { data, status, setAddressDetail } = useLocation();
</script>

<template>
	<div>
		<v-card>
			<v-card-title v-if="data"> Searched Results </v-card-title>
			<v-card-title v-else> Recent Locations </v-card-title>
			<v-card class="px-2" variant="text">
				<v-list nav v-if="status == 'success'">
					<v-card
						v-for="(item, index) in data"
						:key="index"
						variant="outlined"
						link
						class="py-2 mb-2"
						@click="setAddressDetail(item)"
					>
						<v-list-item variant="flat">
							<v-list-item-title> {{ item["display_name"] }}</v-list-item-title>
						</v-list-item>
					</v-card>
				</v-list>
			</v-card>
		</v-card>
	</div>
</template>

<style scoped></style>
