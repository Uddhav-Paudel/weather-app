<script setup lang="ts">
const props = defineProps<{
	name?: any;
	icon?: any;
	label?: any;
	value?: any;
	unit?: any;
}>();
const icon: any = props.icon ?? "icon";
const label: any = props.label ?? "label";
const value: any = props.value ?? "value";
const unit: any = props.unit ?? "Unit";
</script>

<template>
	<div class="mb-1">
		<v-card variant="tonal">
			<v-card-item>
				<template #prepend>
					<v-icon :icon="icon"> </v-icon>
				</template>
				<v-card-title> {{ label }}: {{ value }} {{ unit }}</v-card-title>
			</v-card-item>
		</v-card>
	</div>
</template>

<style scoped></style>
