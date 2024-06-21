import { ref, createVNode, Fragment, computed, withDirectives, resolveDirective, vShow, toRef, watch, mergeProps, cloneVNode, useSSRContext, shallowRef, capitalize, h, defineComponent as defineComponent$1, withCtx, unref, isRef, camelize, nextTick, createTextVNode, withKeys, inject, provide, toRaw, toDisplayString, openBlock, createBlock, renderList, createCommentVNode } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import { d as defineStore, c as useForecastStore, s as storeToRefs, e as useFetch, g as genericComponent, p as provideDefaults, h as propsFactory, I as IconValue, m as makeThemeProps, j as provideTheme, E as EventProp, q as useRtl, t as getUid, v as convertToUnit, y as wrapInArray, B as only, o as useProxiedModel, C as filterInputAttrs, F as defineComponent, G as deprecate, M as breakpoints, N as useSetting, k as useLocale, l as getCurrentInstanceName, w as isOn, x as pick$1, z as getCurrentInstance, A as useToggleScope, D as callEvent, H as deepEqual, J as focusChild, f as useSettingStore, K as getPropertyFromItem, L as omit } from './server.mjs';
import { getCountryCode } from 'countries-list';
import { m as makeComponentProps, u as useRender, a as makeTagProps, b as makeDensityProps, c as makeRoundedProps, d as makeSizeProps, e as makeVariantProps, f as useVariant, g as useDensity, h as useRounded, i as useSize, V as VImg, j as VIcon, k as VDefaultsProvider, l as genOverlays, n as makeBorderProps, o as makeDimensionProps, p as makeElevationProps, q as makeLoaderProps, r as makeLocationProps, s as makePositionProps, t as makeRouterProps, R as Ripple, v as useBorder, w as useDimension, x as useElevation, y as useLoader, z as useLocation$1, A as usePosition, B as useLink, L as LoaderSlot, C as makeTransitionProps$1, D as VSlideYTransition, M as MaybeTransition, E as useBackgroundColor, F as useTextColor, G as nullifyTransforms, H as animate, I as standardEasing, J as VExpandXTransition, K as Intersect, N as forwardRefs, O as useSsrBoot, P as VExpandTransition, Q as VTabsWindow, S as VTabsWindowItem, T as VBtn, U as VBtnToggle } from './VTabsWindowItem-Df1E6CkA.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import '../runtime.mjs';
import 'node:http';
import 'node:https';
import 'fs';
import 'path';
import 'node:fs';
import 'node:url';
import 'ipx';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'devalue';
import '@unhead/ssr';
import 'unhead';
import '@unhead/shared';
import 'vue-router';

function createSimpleFunctional(klass) {
  let tag = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "div";
  let name = arguments.length > 2 ? arguments[2] : void 0;
  return genericComponent()({
    name: name != null ? name : capitalize(camelize(klass.replace(/__/g, "-"))),
    props: {
      tag: {
        type: String,
        default: tag
      },
      ...makeComponentProps()
    },
    setup(props, _ref) {
      let {
        slots
      } = _ref;
      return () => {
        var _a;
        return h(props.tag, {
          class: [klass, props.class],
          style: props.style
        }, (_a = slots.default) == null ? void 0 : _a.call(slots));
      };
    }
  });
}
const useLocationStore = defineStore("location-store", () => {
  const forecastStore = useForecastStore();
  const { latitude, longitude } = storeToRefs(forecastStore);
  const selectedAddress = ref();
  const countryCode = ref();
  const cityOrState = ref("");
  const apiUrl = ref("https://nominatim.openstreetmap.org/search.php?q=");
  const { data, status, error: err, refresh } = useFetch(() => `${apiUrl.value}${cityOrState.value}&polygon_geojson=1&format=jsonv2`, {
    immediate: false,
    watch: false
  }, "$RhobT0awSB");
  const setAddressDetail = (selectedItemObject) => {
    let selectedItemValue = selectedItemObject["display_name"];
    selectedAddress.value = selectedItemValue;
    let sArr = selectedItemValue.split(",");
    let countryName = sArr[sArr.length - 1];
    countryCode.value = getCountryCode(countryName.trim());
    latitude.value = selectedItemObject["lat"];
    longitude.value = selectedItemObject["lon"];
  };
  return { selectedAddress, latitude, longitude, countryCode, cityOrState, data, status, err, setAddressDetail, refresh };
});
const useForecast = () => {
  const forecastStore = useForecastStore();
  const { data, latitude, longitude, temperature_unit, err, status } = storeToRefs(forecastStore);
  const refresh = () => {
    forecastStore.refresh();
  };
  const mappingJson = {
    "Temperature": {
      "variable": "temperature_2m",
      "icon": "mdi-thermometer"
    },
    "Relative Humidity": {
      "variable": "relative_humidity_2m",
      "icon": "mdi-water-percent"
    },
    "Feels Like": {
      "variable": "apparent_temperature",
      "icon": "mdi-thermometer"
    },
    "Day/Night": {
      "variable": "is_day",
      "icon": "mdi-weather-sunny"
      // Use mdi-weather-night for night
    },
    "Precipitation": {
      "variable": "precipitation",
      "icon": "mdi-weather-rainy"
    },
    "Rain": {
      "variable": "rain",
      "icon": "mdi-weather-rainy"
    },
    "Showers": {
      "variable": "showers",
      "icon": "mdi-weather-pouring"
    },
    "Snowfall": {
      "variable": "snowfall",
      "icon": "mdi-weather-snowy"
    },
    "Weather Condition": {
      "variable": "weather_code",
      "icon": "mdi-weather-sunny"
      // Example, replace with actual weather condition icons
    },
    "Cloud Cover": {
      "variable": "cloud_cover",
      "icon": "mdi-cloud"
    },
    "Sea Level Pressure": {
      "variable": "pressure_msl",
      "icon": "mdi-gauge"
    },
    "Surface Pressure": {
      "variable": "surface_pressure",
      "icon": "mdi-gauge"
    },
    "Wind Speed": {
      "variable": "wind_speed_10m",
      "icon": "mdi-weather-windy"
    },
    "Wind Gusts": {
      "variable": "wind_gusts_10m",
      "icon": "mdi-weather-windy"
    }
  };
  const weatherCodeIcon = {
    "0": {
      "label": "Clear Sky",
      "icon": "mdi-weather-sunny"
    },
    "1": {
      "label": "Mainly Clear",
      "icon": "mdi-weather-partly-cloudy"
    },
    "2": {
      "label": "Partly Cloudy",
      "icon": "mdi-weather-partly-cloudy"
    },
    "3": {
      "label": "Overcast",
      "icon": "mdi-weather-cloudy"
    },
    "45": {
      "label": "Fog",
      "icon": "mdi-weather-fog"
    },
    "48": {
      "label": "Depositing Rime Fog",
      "icon": "mdi-weather-fog"
    },
    "51": {
      "label": "Light Drizzle",
      "icon": "mdi-weather-rainy"
    },
    "53": {
      "label": "Moderate Drizzle",
      "icon": "mdi-weather-rainy"
    },
    "55": {
      "label": "Dense Drizzle",
      "icon": "mdi-weather-pouring"
    },
    "56": {
      "label": "Light Freezing Drizzle",
      "icon": "mdi-weather-hail"
    },
    "57": {
      "label": "Dense Freezing Drizzle",
      "icon": "mdi-weather-hail"
    },
    "61": {
      "label": "Slight Rain",
      "icon": "mdi-weather-rainy"
    },
    "63": {
      "label": "Moderate Rain",
      "icon": "mdi-weather-pouring"
    },
    "65": {
      "label": "Heavy Rain",
      "icon": "mdi-weather-pouring"
    },
    "66": {
      "label": "Light Freezing Rain",
      "icon": "mdi-weather-hail"
    },
    "67": {
      "label": "Heavy Freezing Rain",
      "icon": "mdi-weather-hail"
    },
    "71": {
      "label": "Slight Snowfall",
      "icon": "mdi-weather-snowy"
    },
    "73": {
      "label": "Moderate Snowfall",
      "icon": "mdi-weather-snowy"
    },
    "75": {
      "label": "Heavy Snowfall",
      "icon": "mdi-weather-snowy"
    },
    "77": {
      "label": "Snow Grains",
      "icon": "mdi-weather-snowy"
    },
    "80": {
      "label": "Slight Rain Showers",
      "icon": "mdi-weather-rainy"
    },
    "81": {
      "label": "Moderate Rain Showers",
      "icon": "mdi-weather-pouring"
    },
    "82": {
      "label": "Violent Rain Showers",
      "icon": "mdi-weather-pouring"
    },
    "85": {
      "label": "Slight Snow Showers",
      "icon": "mdi-weather-snowy"
    },
    "86": {
      "label": "Heavy Snow Showers",
      "icon": "mdi-weather-snowy"
    },
    "95": {
      "label": "Slight Thunderstorm",
      "icon": "mdi-weather-lightning"
    },
    "96": {
      "label": "Thunderstorm with Slight Hail",
      "icon": "mdi-weather-lightning-rainy"
    },
    "99": {
      "label": "Thunderstorm with Heavy Hail",
      "icon": "mdi-weather-lightning-rainy"
    }
  };
  const getIcon = (keyName) => {
    return mappingJson[keyName]["icon"];
  };
  const getUnit = (keyName) => {
    var _a;
    const currentWeatherParamValues = (_a = data.value) == null ? void 0 : _a["current_units"];
    const variable = mappingJson[keyName]["variable"];
    return currentWeatherParamValues[variable];
  };
  const getValue = (keyName, valueLabel) => {
    var _a;
    const variable = mappingJson[keyName]["variable"];
    if (variable != "weather_code" && valueLabel == "icon") {
      return mappingJson[keyName]["icon"];
    } else {
      const currentWeatherParamValues = (_a = data.value) == null ? void 0 : _a["current"];
      const variable2 = mappingJson[keyName]["variable"];
      if (variable2 == "weather_code") {
        const weather_code = currentWeatherParamValues[variable2];
        if (valueLabel == "icon") {
          return weatherCodeIcon[weather_code]["icon"];
        } else {
          return weatherCodeIcon[weather_code]["label"];
        }
      } else {
        return currentWeatherParamValues[variable2];
      }
    }
  };
  const getCurrentLocaleDateString = (dateString) => {
    let date = /* @__PURE__ */ new Date();
    if (dateString) {
      date = /* @__PURE__ */ new Date(dateString + "Z");
    }
    const options = {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      year: "numeric",
      month: "long",
      day: "numeric"
    };
    return date.toLocaleString("en-GB", options);
  };
  return { data, err, status, latitude, longitude, temperature_unit, refresh, getCurrentLocaleDateString, getValue, getUnit, getIcon };
};
const useLocation = () => {
  const locationStore = useLocationStore();
  const { data, selectedAddress, cityOrState, countryCode, err, status } = storeToRefs(locationStore);
  const forecastStore = useForecastStore();
  useForecast();
  const settingStore = useSettingStore();
  const { tabs } = storeToRefs(settingStore);
  const refresh = () => {
    locationStore.refresh();
  };
  const getCurrentLocationWeather = () => {
  };
  const setAddressDetail = (item) => {
    locationStore.setAddressDetail(item);
    forecastStore.refresh();
    tabs.value = "forecast";
  };
  return { data, selectedAddress, cityOrState, countryCode, err, setAddressDetail, status, refresh, getCurrentLocationWeather };
};
const VCardActions = genericComponent()({
  name: "VCardActions",
  props: makeComponentProps(),
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    provideDefaults({
      VBtn: {
        slim: true,
        variant: "text"
      }
    });
    useRender(() => {
      var _a;
      return createVNode("div", {
        "class": ["v-card-actions", props.class],
        "style": props.style
      }, [(_a = slots.default) == null ? void 0 : _a.call(slots)]);
    });
    return {};
  }
});
const makeVCardSubtitleProps = propsFactory({
  opacity: [Number, String],
  ...makeComponentProps(),
  ...makeTagProps()
}, "VCardSubtitle");
const VCardSubtitle = genericComponent()({
  name: "VCardSubtitle",
  props: makeVCardSubtitleProps(),
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    useRender(() => createVNode(props.tag, {
      "class": ["v-card-subtitle", props.class],
      "style": [{
        "--v-card-subtitle-opacity": props.opacity
      }, props.style]
    }, slots));
    return {};
  }
});
const VCardTitle = createSimpleFunctional("v-card-title");
const makeVAvatarProps = propsFactory({
  start: Boolean,
  end: Boolean,
  icon: IconValue,
  image: String,
  text: String,
  ...makeComponentProps(),
  ...makeDensityProps(),
  ...makeRoundedProps(),
  ...makeSizeProps(),
  ...makeTagProps(),
  ...makeThemeProps(),
  ...makeVariantProps({
    variant: "flat"
  })
}, "VAvatar");
const VAvatar = genericComponent()({
  name: "VAvatar",
  props: makeVAvatarProps(),
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    const {
      themeClasses
    } = provideTheme(props);
    const {
      colorClasses,
      colorStyles,
      variantClasses
    } = useVariant(props);
    const {
      densityClasses
    } = useDensity(props);
    const {
      roundedClasses
    } = useRounded(props);
    const {
      sizeClasses,
      sizeStyles
    } = useSize(props);
    useRender(() => createVNode(props.tag, {
      "class": ["v-avatar", {
        "v-avatar--start": props.start,
        "v-avatar--end": props.end
      }, themeClasses.value, colorClasses.value, densityClasses.value, roundedClasses.value, sizeClasses.value, variantClasses.value, props.class],
      "style": [colorStyles.value, sizeStyles.value, props.style]
    }, {
      default: () => [!slots.default ? props.image ? createVNode(VImg, {
        "key": "image",
        "src": props.image,
        "alt": "",
        "cover": true
      }, null) : props.icon ? createVNode(VIcon, {
        "key": "icon",
        "icon": props.icon
      }, null) : props.text : createVNode(VDefaultsProvider, {
        "key": "content-defaults",
        "defaults": {
          VImg: {
            cover: true,
            image: props.image
          },
          VIcon: {
            icon: props.icon
          }
        }
      }, {
        default: () => [slots.default()]
      }), genOverlays(false, "v-avatar")]
    }));
    return {};
  }
});
const makeCardItemProps = propsFactory({
  appendAvatar: String,
  appendIcon: IconValue,
  prependAvatar: String,
  prependIcon: IconValue,
  subtitle: [String, Number],
  title: [String, Number],
  ...makeComponentProps(),
  ...makeDensityProps()
}, "VCardItem");
const VCardItem = genericComponent()({
  name: "VCardItem",
  props: makeCardItemProps(),
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    useRender(() => {
      var _a;
      const hasPrependMedia = !!(props.prependAvatar || props.prependIcon);
      const hasPrepend = !!(hasPrependMedia || slots.prepend);
      const hasAppendMedia = !!(props.appendAvatar || props.appendIcon);
      const hasAppend = !!(hasAppendMedia || slots.append);
      const hasTitle = !!(props.title != null || slots.title);
      const hasSubtitle = !!(props.subtitle != null || slots.subtitle);
      return createVNode("div", {
        "class": ["v-card-item", props.class],
        "style": props.style
      }, [hasPrepend && createVNode("div", {
        "key": "prepend",
        "class": "v-card-item__prepend"
      }, [!slots.prepend ? createVNode(Fragment, null, [props.prependAvatar && createVNode(VAvatar, {
        "key": "prepend-avatar",
        "density": props.density,
        "image": props.prependAvatar
      }, null), props.prependIcon && createVNode(VIcon, {
        "key": "prepend-icon",
        "density": props.density,
        "icon": props.prependIcon
      }, null)]) : createVNode(VDefaultsProvider, {
        "key": "prepend-defaults",
        "disabled": !hasPrependMedia,
        "defaults": {
          VAvatar: {
            density: props.density,
            image: props.prependAvatar
          },
          VIcon: {
            density: props.density,
            icon: props.prependIcon
          }
        }
      }, slots.prepend)]), createVNode("div", {
        "class": "v-card-item__content"
      }, [hasTitle && createVNode(VCardTitle, {
        "key": "title"
      }, {
        default: () => {
          var _a3;
          var _a2;
          return [(_a3 = (_a2 = slots.title) == null ? void 0 : _a2.call(slots)) != null ? _a3 : props.title];
        }
      }), hasSubtitle && createVNode(VCardSubtitle, {
        "key": "subtitle"
      }, {
        default: () => {
          var _a3;
          var _a2;
          return [(_a3 = (_a2 = slots.subtitle) == null ? void 0 : _a2.call(slots)) != null ? _a3 : props.subtitle];
        }
      }), (_a = slots.default) == null ? void 0 : _a.call(slots)]), hasAppend && createVNode("div", {
        "key": "append",
        "class": "v-card-item__append"
      }, [!slots.append ? createVNode(Fragment, null, [props.appendIcon && createVNode(VIcon, {
        "key": "append-icon",
        "density": props.density,
        "icon": props.appendIcon
      }, null), props.appendAvatar && createVNode(VAvatar, {
        "key": "append-avatar",
        "density": props.density,
        "image": props.appendAvatar
      }, null)]) : createVNode(VDefaultsProvider, {
        "key": "append-defaults",
        "disabled": !hasAppendMedia,
        "defaults": {
          VAvatar: {
            density: props.density,
            image: props.appendAvatar
          },
          VIcon: {
            density: props.density,
            icon: props.appendIcon
          }
        }
      }, slots.append)])]);
    });
    return {};
  }
});
const makeVCardTextProps = propsFactory({
  opacity: [Number, String],
  ...makeComponentProps(),
  ...makeTagProps()
}, "VCardText");
const VCardText = genericComponent()({
  name: "VCardText",
  props: makeVCardTextProps(),
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    useRender(() => createVNode(props.tag, {
      "class": ["v-card-text", props.class],
      "style": [{
        "--v-card-text-opacity": props.opacity
      }, props.style]
    }, slots));
    return {};
  }
});
const makeVCardProps = propsFactory({
  appendAvatar: String,
  appendIcon: IconValue,
  disabled: Boolean,
  flat: Boolean,
  hover: Boolean,
  image: String,
  link: {
    type: Boolean,
    default: void 0
  },
  prependAvatar: String,
  prependIcon: IconValue,
  ripple: {
    type: [Boolean, Object],
    default: true
  },
  subtitle: [String, Number],
  text: [String, Number],
  title: [String, Number],
  ...makeBorderProps(),
  ...makeComponentProps(),
  ...makeDensityProps(),
  ...makeDimensionProps(),
  ...makeElevationProps(),
  ...makeLoaderProps(),
  ...makeLocationProps(),
  ...makePositionProps(),
  ...makeRoundedProps(),
  ...makeRouterProps(),
  ...makeTagProps(),
  ...makeThemeProps(),
  ...makeVariantProps({
    variant: "elevated"
  })
}, "VCard");
const VCard = genericComponent()({
  name: "VCard",
  directives: {
    Ripple
  },
  props: makeVCardProps(),
  setup(props, _ref) {
    let {
      attrs,
      slots
    } = _ref;
    const {
      themeClasses
    } = provideTheme(props);
    const {
      borderClasses
    } = useBorder(props);
    const {
      colorClasses,
      colorStyles,
      variantClasses
    } = useVariant(props);
    const {
      densityClasses
    } = useDensity(props);
    const {
      dimensionStyles
    } = useDimension(props);
    const {
      elevationClasses
    } = useElevation(props);
    const {
      loaderClasses
    } = useLoader(props);
    const {
      locationStyles
    } = useLocation$1(props);
    const {
      positionClasses
    } = usePosition(props);
    const {
      roundedClasses
    } = useRounded(props);
    const link = useLink(props, attrs);
    const isLink = computed(() => props.link !== false && link.isLink.value);
    const isClickable = computed(() => !props.disabled && props.link !== false && (props.link || link.isClickable.value));
    useRender(() => {
      const Tag = isLink.value ? "a" : props.tag;
      const hasTitle = !!(slots.title || props.title != null);
      const hasSubtitle = !!(slots.subtitle || props.subtitle != null);
      const hasHeader = hasTitle || hasSubtitle;
      const hasAppend = !!(slots.append || props.appendAvatar || props.appendIcon);
      const hasPrepend = !!(slots.prepend || props.prependAvatar || props.prependIcon);
      const hasImage = !!(slots.image || props.image);
      const hasCardItem = hasHeader || hasPrepend || hasAppend;
      const hasText = !!(slots.text || props.text != null);
      return withDirectives(createVNode(Tag, {
        "class": ["v-card", {
          "v-card--disabled": props.disabled,
          "v-card--flat": props.flat,
          "v-card--hover": props.hover && !(props.disabled || props.flat),
          "v-card--link": isClickable.value
        }, themeClasses.value, borderClasses.value, colorClasses.value, densityClasses.value, elevationClasses.value, loaderClasses.value, positionClasses.value, roundedClasses.value, variantClasses.value, props.class],
        "style": [colorStyles.value, dimensionStyles.value, locationStyles.value, props.style],
        "href": link.href.value,
        "onClick": isClickable.value && link.navigate,
        "tabindex": props.disabled ? -1 : void 0
      }, {
        default: () => {
          var _a;
          return [hasImage && createVNode("div", {
            "key": "image",
            "class": "v-card__image"
          }, [!slots.image ? createVNode(VImg, {
            "key": "image-img",
            "cover": true,
            "src": props.image
          }, null) : createVNode(VDefaultsProvider, {
            "key": "image-defaults",
            "disabled": !props.image,
            "defaults": {
              VImg: {
                cover: true,
                src: props.image
              }
            }
          }, slots.image)]), createVNode(LoaderSlot, {
            "name": "v-card",
            "active": !!props.loading,
            "color": typeof props.loading === "boolean" ? void 0 : props.loading
          }, {
            default: slots.loader
          }), hasCardItem && createVNode(VCardItem, {
            "key": "item",
            "prependAvatar": props.prependAvatar,
            "prependIcon": props.prependIcon,
            "title": props.title,
            "subtitle": props.subtitle,
            "appendAvatar": props.appendAvatar,
            "appendIcon": props.appendIcon
          }, {
            default: slots.item,
            prepend: slots.prepend,
            title: slots.title,
            subtitle: slots.subtitle,
            append: slots.append
          }), hasText && createVNode(VCardText, {
            "key": "text"
          }, {
            default: () => {
              var _a3;
              var _a2;
              return [(_a3 = (_a2 = slots.text) == null ? void 0 : _a2.call(slots)) != null ? _a3 : props.text];
            }
          }), (_a = slots.default) == null ? void 0 : _a.call(slots), slots.actions && createVNode(VCardActions, null, {
            default: slots.actions
          }), genOverlays(isClickable.value, "v-card")];
        }
      }), [[resolveDirective("ripple"), isClickable.value && props.ripple]]);
    });
    return {};
  }
});
const makeVCounterProps = propsFactory({
  active: Boolean,
  disabled: Boolean,
  max: [Number, String],
  value: {
    type: [Number, String],
    default: 0
  },
  ...makeComponentProps(),
  ...makeTransitionProps$1({
    transition: {
      component: VSlideYTransition
    }
  })
}, "VCounter");
const VCounter = genericComponent()({
  name: "VCounter",
  functional: true,
  props: makeVCounterProps(),
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    const counter = computed(() => {
      return props.max ? `${props.value} / ${props.max}` : String(props.value);
    });
    useRender(() => createVNode(MaybeTransition, {
      "transition": props.transition
    }, {
      default: () => [withDirectives(createVNode("div", {
        "class": ["v-counter", {
          "text-error": props.max && !props.disabled && parseFloat(props.value) > parseFloat(props.max)
        }, props.class],
        "style": props.style
      }, [slots.default ? slots.default({
        counter: counter.value,
        max: props.max,
        value: props.value
      }) : counter.value]), [[vShow, props.active]])]
    }));
    return {};
  }
});
const makeVLabelProps = propsFactory({
  text: String,
  onClick: EventProp(),
  ...makeComponentProps(),
  ...makeThemeProps()
}, "VLabel");
const VLabel = genericComponent()({
  name: "VLabel",
  props: makeVLabelProps(),
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    useRender(() => {
      var _a;
      return createVNode("label", {
        "class": ["v-label", {
          "v-label--clickable": !!props.onClick
        }, props.class],
        "style": props.style,
        "onClick": props.onClick
      }, [props.text, (_a = slots.default) == null ? void 0 : _a.call(slots)]);
    });
    return {};
  }
});
const makeVFieldLabelProps = propsFactory({
  floating: Boolean,
  ...makeComponentProps()
}, "VFieldLabel");
const VFieldLabel = genericComponent()({
  name: "VFieldLabel",
  props: makeVFieldLabelProps(),
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    useRender(() => createVNode(VLabel, {
      "class": ["v-field-label", {
        "v-field-label--floating": props.floating
      }, props.class],
      "style": props.style,
      "aria-hidden": props.floating || void 0
    }, slots));
    return {};
  }
});
function useInputIcon(props) {
  const {
    t
  } = useLocale();
  function InputIcon(_ref) {
    var _a;
    let {
      name
    } = _ref;
    const localeKey = {
      prepend: "prependAction",
      prependInner: "prependAction",
      append: "appendAction",
      appendInner: "appendAction",
      clear: "clear"
    }[name];
    const listener = props[`onClick:${name}`];
    const label = listener && localeKey ? t(`$vuetify.input.${localeKey}`, (_a = props.label) != null ? _a : "") : void 0;
    return createVNode(VIcon, {
      "icon": props[`${name}Icon`],
      "aria-label": label,
      "onClick": listener
    }, null);
  }
  return {
    InputIcon
  };
}
const makeFocusProps = propsFactory({
  focused: Boolean,
  "onUpdate:focused": EventProp()
}, "focus");
function useFocus(props) {
  let name = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : getCurrentInstanceName();
  const isFocused = useProxiedModel(props, "focused");
  const focusClasses = computed(() => {
    return {
      [`${name}--focused`]: isFocused.value
    };
  });
  function focus() {
    isFocused.value = true;
  }
  function blur() {
    isFocused.value = false;
  }
  return {
    focusClasses,
    isFocused,
    focus,
    blur
  };
}
const allowedVariants = ["underlined", "outlined", "filled", "solo", "solo-inverted", "solo-filled", "plain"];
const makeVFieldProps = propsFactory({
  appendInnerIcon: IconValue,
  bgColor: String,
  clearable: Boolean,
  clearIcon: {
    type: IconValue,
    default: "$clear"
  },
  active: Boolean,
  centerAffix: {
    type: Boolean,
    default: void 0
  },
  color: String,
  baseColor: String,
  dirty: Boolean,
  disabled: {
    type: Boolean,
    default: null
  },
  error: Boolean,
  flat: Boolean,
  label: String,
  persistentClear: Boolean,
  prependInnerIcon: IconValue,
  reverse: Boolean,
  singleLine: Boolean,
  variant: {
    type: String,
    default: "filled",
    validator: (v) => allowedVariants.includes(v)
  },
  "onClick:clear": EventProp(),
  "onClick:appendInner": EventProp(),
  "onClick:prependInner": EventProp(),
  ...makeComponentProps(),
  ...makeLoaderProps(),
  ...makeRoundedProps(),
  ...makeThemeProps()
}, "VField");
const VField = genericComponent()({
  name: "VField",
  inheritAttrs: false,
  props: {
    id: String,
    ...makeFocusProps(),
    ...makeVFieldProps()
  },
  emits: {
    "update:focused": (focused) => true,
    "update:modelValue": (value) => true
  },
  setup(props, _ref) {
    let {
      attrs,
      emit,
      slots
    } = _ref;
    const {
      themeClasses
    } = provideTheme(props);
    const {
      loaderClasses
    } = useLoader(props);
    const {
      focusClasses,
      isFocused,
      focus,
      blur
    } = useFocus(props);
    const {
      InputIcon
    } = useInputIcon(props);
    const {
      roundedClasses
    } = useRounded(props);
    const {
      rtlClasses
    } = useRtl();
    const isActive = computed(() => props.dirty || props.active);
    const hasLabel = computed(() => !props.singleLine && !!(props.label || slots.label));
    const uid = getUid();
    const id = computed(() => props.id || `input-${uid}`);
    const messagesId = computed(() => `${id.value}-messages`);
    const labelRef = ref();
    const floatingLabelRef = ref();
    const controlRef = ref();
    const isPlainOrUnderlined = computed(() => ["plain", "underlined"].includes(props.variant));
    const {
      backgroundColorClasses,
      backgroundColorStyles
    } = useBackgroundColor(toRef(props, "bgColor"));
    const {
      textColorClasses,
      textColorStyles
    } = useTextColor(computed(() => {
      return props.error || props.disabled ? void 0 : isActive.value && isFocused.value ? props.color : props.baseColor;
    }));
    watch(isActive, (val) => {
      if (hasLabel.value) {
        const el = labelRef.value.$el;
        const targetEl = floatingLabelRef.value.$el;
        requestAnimationFrame(() => {
          const rect = nullifyTransforms(el);
          const targetRect = targetEl.getBoundingClientRect();
          const x = targetRect.x - rect.x;
          const y = targetRect.y - rect.y - (rect.height / 2 - targetRect.height / 2);
          const targetWidth = targetRect.width / 0.75;
          const width = Math.abs(targetWidth - rect.width) > 1 ? {
            maxWidth: convertToUnit(targetWidth)
          } : void 0;
          const style = getComputedStyle(el);
          const targetStyle = getComputedStyle(targetEl);
          const duration = parseFloat(style.transitionDuration) * 1e3 || 150;
          const scale = parseFloat(targetStyle.getPropertyValue("--v-field-label-scale"));
          const color = targetStyle.getPropertyValue("color");
          el.style.visibility = "visible";
          targetEl.style.visibility = "hidden";
          animate(el, {
            transform: `translate(${x}px, ${y}px) scale(${scale})`,
            color,
            ...width
          }, {
            duration,
            easing: standardEasing,
            direction: val ? "normal" : "reverse"
          }).finished.then(() => {
            el.style.removeProperty("visibility");
            targetEl.style.removeProperty("visibility");
          });
        });
      }
    }, {
      flush: "post"
    });
    const slotProps = computed(() => ({
      isActive,
      isFocused,
      controlRef,
      blur,
      focus
    }));
    function onClick(e) {
      if (e.target !== (void 0).activeElement) {
        e.preventDefault();
      }
    }
    function onKeydownClear(e) {
      var _a;
      if (e.key !== "Enter" && e.key !== " ")
        return;
      e.preventDefault();
      e.stopPropagation();
      (_a = props["onClick:clear"]) == null ? void 0 : _a.call(props, new MouseEvent("click"));
    }
    useRender(() => {
      var _a2;
      var _a, _b, _c;
      const isOutlined = props.variant === "outlined";
      const hasPrepend = !!(slots["prepend-inner"] || props.prependInnerIcon);
      const hasClear = !!(props.clearable || slots.clear);
      const hasAppend = !!(slots["append-inner"] || props.appendInnerIcon || hasClear);
      const label = () => slots.label ? slots.label({
        ...slotProps.value,
        label: props.label,
        props: {
          for: id.value
        }
      }) : props.label;
      return createVNode("div", mergeProps({
        "class": ["v-field", {
          "v-field--active": isActive.value,
          "v-field--appended": hasAppend,
          "v-field--center-affix": (_a2 = props.centerAffix) != null ? _a2 : !isPlainOrUnderlined.value,
          "v-field--disabled": props.disabled,
          "v-field--dirty": props.dirty,
          "v-field--error": props.error,
          "v-field--flat": props.flat,
          "v-field--has-background": !!props.bgColor,
          "v-field--persistent-clear": props.persistentClear,
          "v-field--prepended": hasPrepend,
          "v-field--reverse": props.reverse,
          "v-field--single-line": props.singleLine,
          "v-field--no-label": !label(),
          [`v-field--variant-${props.variant}`]: true
        }, themeClasses.value, backgroundColorClasses.value, focusClasses.value, loaderClasses.value, roundedClasses.value, rtlClasses.value, props.class],
        "style": [backgroundColorStyles.value, props.style],
        "onClick": onClick
      }, attrs), [createVNode("div", {
        "class": "v-field__overlay"
      }, null), createVNode(LoaderSlot, {
        "name": "v-field",
        "active": !!props.loading,
        "color": props.error ? "error" : typeof props.loading === "string" ? props.loading : props.color
      }, {
        default: slots.loader
      }), hasPrepend && createVNode("div", {
        "key": "prepend",
        "class": "v-field__prepend-inner"
      }, [props.prependInnerIcon && createVNode(InputIcon, {
        "key": "prepend-icon",
        "name": "prependInner"
      }, null), (_a = slots["prepend-inner"]) == null ? void 0 : _a.call(slots, slotProps.value)]), createVNode("div", {
        "class": "v-field__field",
        "data-no-activator": ""
      }, [["filled", "solo", "solo-inverted", "solo-filled"].includes(props.variant) && hasLabel.value && createVNode(VFieldLabel, {
        "key": "floating-label",
        "ref": floatingLabelRef,
        "class": [textColorClasses.value],
        "floating": true,
        "for": id.value,
        "style": textColorStyles.value
      }, {
        default: () => [label()]
      }), createVNode(VFieldLabel, {
        "ref": labelRef,
        "for": id.value
      }, {
        default: () => [label()]
      }), (_b = slots.default) == null ? void 0 : _b.call(slots, {
        ...slotProps.value,
        props: {
          id: id.value,
          class: "v-field__input",
          "aria-describedby": messagesId.value
        },
        focus,
        blur
      })]), hasClear && createVNode(VExpandXTransition, {
        "key": "clear"
      }, {
        default: () => [withDirectives(createVNode("div", {
          "class": "v-field__clearable",
          "onMousedown": (e) => {
            e.preventDefault();
            e.stopPropagation();
          }
        }, [createVNode(VDefaultsProvider, {
          "defaults": {
            VIcon: {
              icon: props.clearIcon
            }
          }
        }, {
          default: () => [slots.clear ? slots.clear({
            ...slotProps.value,
            props: {
              onKeydown: onKeydownClear,
              onFocus: focus,
              onBlur: blur,
              onClick: props["onClick:clear"]
            }
          }) : createVNode(InputIcon, {
            "name": "clear",
            "onKeydown": onKeydownClear,
            "onFocus": focus,
            "onBlur": blur
          }, null)]
        })]), [[vShow, props.dirty]])]
      }), hasAppend && createVNode("div", {
        "key": "append",
        "class": "v-field__append-inner"
      }, [(_c = slots["append-inner"]) == null ? void 0 : _c.call(slots, slotProps.value), props.appendInnerIcon && createVNode(InputIcon, {
        "key": "append-icon",
        "name": "appendInner"
      }, null)]), createVNode("div", {
        "class": ["v-field__outline", textColorClasses.value],
        "style": textColorStyles.value
      }, [isOutlined && createVNode(Fragment, null, [createVNode("div", {
        "class": "v-field__outline__start"
      }, null), hasLabel.value && createVNode("div", {
        "class": "v-field__outline__notch"
      }, [createVNode(VFieldLabel, {
        "ref": floatingLabelRef,
        "floating": true,
        "for": id.value
      }, {
        default: () => [label()]
      })]), createVNode("div", {
        "class": "v-field__outline__end"
      }, null)]), isPlainOrUnderlined.value && hasLabel.value && createVNode(VFieldLabel, {
        "ref": floatingLabelRef,
        "floating": true,
        "for": id.value
      }, {
        default: () => [label()]
      })])]);
    });
    return {
      controlRef
    };
  }
});
function filterFieldProps(attrs) {
  const keys = Object.keys(VField.props).filter((k) => !isOn(k) && k !== "class" && k !== "style");
  return pick$1(attrs, keys);
}
const makeVMessagesProps = propsFactory({
  active: Boolean,
  color: String,
  messages: {
    type: [Array, String],
    default: () => []
  },
  ...makeComponentProps(),
  ...makeTransitionProps$1({
    transition: {
      component: VSlideYTransition,
      leaveAbsolute: true,
      group: true
    }
  })
}, "VMessages");
const VMessages = genericComponent()({
  name: "VMessages",
  props: makeVMessagesProps(),
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    const messages = computed(() => wrapInArray(props.messages));
    const {
      textColorClasses,
      textColorStyles
    } = useTextColor(computed(() => props.color));
    useRender(() => createVNode(MaybeTransition, {
      "transition": props.transition,
      "tag": "div",
      "class": ["v-messages", textColorClasses.value, props.class],
      "style": [textColorStyles.value, props.style],
      "role": "alert",
      "aria-live": "polite"
    }, {
      default: () => [props.active && messages.value.map((message, i) => createVNode("div", {
        "class": "v-messages__message",
        "key": `${i}-${messages.value}`
      }, [slots.message ? slots.message({
        message
      }) : message]))]
    }));
    return {};
  }
});
const FormKey = Symbol.for("vuetify:form");
function useForm() {
  return inject(FormKey, null);
}
const makeValidationProps = propsFactory({
  disabled: {
    type: Boolean,
    default: null
  },
  error: Boolean,
  errorMessages: {
    type: [Array, String],
    default: () => []
  },
  maxErrors: {
    type: [Number, String],
    default: 1
  },
  name: String,
  label: String,
  readonly: {
    type: Boolean,
    default: null
  },
  rules: {
    type: Array,
    default: () => []
  },
  modelValue: null,
  validateOn: String,
  validationValue: null,
  ...makeFocusProps()
}, "validation");
function useValidation(props) {
  let name = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : getCurrentInstanceName();
  let id = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : getUid();
  const model = useProxiedModel(props, "modelValue");
  const validationModel = computed(() => props.validationValue === void 0 ? model.value : props.validationValue);
  const form = useForm();
  const internalErrorMessages = ref([]);
  const isPristine = shallowRef(true);
  const isDirty = computed(() => !!(wrapInArray(model.value === "" ? null : model.value).length || wrapInArray(validationModel.value === "" ? null : validationModel.value).length));
  const isDisabled = computed(() => {
    var _a;
    return !!((_a = props.disabled) != null ? _a : form == null ? void 0 : form.isDisabled.value);
  });
  const isReadonly = computed(() => {
    var _a;
    return !!((_a = props.readonly) != null ? _a : form == null ? void 0 : form.isReadonly.value);
  });
  const errorMessages = computed(() => {
    var _a;
    return ((_a = props.errorMessages) == null ? void 0 : _a.length) ? wrapInArray(props.errorMessages).concat(internalErrorMessages.value).slice(0, Math.max(0, +props.maxErrors)) : internalErrorMessages.value;
  });
  const validateOn = computed(() => {
    var _a, _b;
    let value = ((_a = props.validateOn) != null ? _a : form == null ? void 0 : form.validateOn.value) || "input";
    if (value === "lazy")
      value = "input lazy";
    const set = new Set((_b = value == null ? void 0 : value.split(" ")) != null ? _b : []);
    return {
      blur: set.has("blur") || set.has("input"),
      input: set.has("input"),
      submit: set.has("submit"),
      lazy: set.has("lazy")
    };
  });
  const isValid = computed(() => {
    var _a;
    if (props.error || ((_a = props.errorMessages) == null ? void 0 : _a.length))
      return false;
    if (!props.rules.length)
      return true;
    if (isPristine.value) {
      return internalErrorMessages.value.length || validateOn.value.lazy ? null : true;
    } else {
      return !internalErrorMessages.value.length;
    }
  });
  const isValidating = shallowRef(false);
  const validationClasses = computed(() => {
    return {
      [`${name}--error`]: isValid.value === false,
      [`${name}--dirty`]: isDirty.value,
      [`${name}--disabled`]: isDisabled.value,
      [`${name}--readonly`]: isReadonly.value
    };
  });
  getCurrentInstance("validation");
  const uid = computed(() => {
    var _a;
    return (_a = props.name) != null ? _a : unref(id);
  });
  useToggleScope(() => validateOn.value.input, () => {
    watch(validationModel, () => {
      if (validationModel.value != null) {
        validate();
      } else if (props.focused) {
        const unwatch = watch(() => props.focused, (val) => {
          if (!val)
            validate();
          unwatch();
        });
      }
    });
  });
  useToggleScope(() => validateOn.value.blur, () => {
    watch(() => props.focused, (val) => {
      if (!val)
        validate();
    });
  });
  watch([isValid, errorMessages], () => {
    form == null ? void 0 : form.update(uid.value, isValid.value, errorMessages.value);
  });
  async function reset() {
    model.value = null;
    await nextTick();
    await resetValidation();
  }
  async function resetValidation() {
    isPristine.value = true;
    if (!validateOn.value.lazy) {
      await validate(true);
    } else {
      internalErrorMessages.value = [];
    }
  }
  async function validate() {
    var _a;
    let silent = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : false;
    const results = [];
    isValidating.value = true;
    for (const rule of props.rules) {
      if (results.length >= +((_a = props.maxErrors) != null ? _a : 1)) {
        break;
      }
      const handler = typeof rule === "function" ? rule : () => rule;
      const result = await handler(validationModel.value);
      if (result === true)
        continue;
      if (result !== false && typeof result !== "string") {
        console.warn(`${result} is not a valid value. Rule functions must return boolean true or a string.`);
        continue;
      }
      results.push(result || "");
    }
    internalErrorMessages.value = results;
    isValidating.value = false;
    isPristine.value = silent;
    return internalErrorMessages.value;
  }
  return {
    errorMessages,
    isDirty,
    isDisabled,
    isReadonly,
    isPristine,
    isValid,
    isValidating,
    reset,
    resetValidation,
    validate,
    validationClasses
  };
}
const makeVInputProps = propsFactory({
  id: String,
  appendIcon: IconValue,
  centerAffix: {
    type: Boolean,
    default: true
  },
  prependIcon: IconValue,
  hideDetails: [Boolean, String],
  hideSpinButtons: Boolean,
  hint: String,
  persistentHint: Boolean,
  messages: {
    type: [Array, String],
    default: () => []
  },
  direction: {
    type: String,
    default: "horizontal",
    validator: (v) => ["horizontal", "vertical"].includes(v)
  },
  "onClick:prepend": EventProp(),
  "onClick:append": EventProp(),
  ...makeComponentProps(),
  ...makeDensityProps(),
  ...only(makeDimensionProps(), ["maxWidth", "minWidth", "width"]),
  ...makeThemeProps(),
  ...makeValidationProps()
}, "VInput");
const VInput = genericComponent()({
  name: "VInput",
  props: {
    ...makeVInputProps()
  },
  emits: {
    "update:modelValue": (value) => true
  },
  setup(props, _ref) {
    let {
      attrs,
      slots,
      emit
    } = _ref;
    const {
      densityClasses
    } = useDensity(props);
    const {
      dimensionStyles
    } = useDimension(props);
    const {
      themeClasses
    } = provideTheme(props);
    const {
      rtlClasses
    } = useRtl();
    const {
      InputIcon
    } = useInputIcon(props);
    const uid = getUid();
    const id = computed(() => props.id || `input-${uid}`);
    const messagesId = computed(() => `${id.value}-messages`);
    const {
      errorMessages,
      isDirty,
      isDisabled,
      isReadonly,
      isPristine,
      isValid,
      isValidating,
      reset,
      resetValidation,
      validate,
      validationClasses
    } = useValidation(props, "v-input", id);
    const slotProps = computed(() => ({
      id,
      messagesId,
      isDirty,
      isDisabled,
      isReadonly,
      isPristine,
      isValid,
      isValidating,
      reset,
      resetValidation,
      validate
    }));
    const messages = computed(() => {
      var _a;
      if (((_a = props.errorMessages) == null ? void 0 : _a.length) || !isPristine.value && errorMessages.value.length) {
        return errorMessages.value;
      } else if (props.hint && (props.persistentHint || props.focused)) {
        return props.hint;
      } else {
        return props.messages;
      }
    });
    useRender(() => {
      var _a, _b, _c, _d;
      const hasPrepend = !!(slots.prepend || props.prependIcon);
      const hasAppend = !!(slots.append || props.appendIcon);
      const hasMessages = messages.value.length > 0;
      const hasDetails = !props.hideDetails || props.hideDetails === "auto" && (hasMessages || !!slots.details);
      return createVNode("div", {
        "class": ["v-input", `v-input--${props.direction}`, {
          "v-input--center-affix": props.centerAffix,
          "v-input--hide-spin-buttons": props.hideSpinButtons
        }, densityClasses.value, themeClasses.value, rtlClasses.value, validationClasses.value, props.class],
        "style": [dimensionStyles.value, props.style]
      }, [hasPrepend && createVNode("div", {
        "key": "prepend",
        "class": "v-input__prepend"
      }, [(_a = slots.prepend) == null ? void 0 : _a.call(slots, slotProps.value), props.prependIcon && createVNode(InputIcon, {
        "key": "prepend-icon",
        "name": "prepend"
      }, null)]), slots.default && createVNode("div", {
        "class": "v-input__control"
      }, [(_b = slots.default) == null ? void 0 : _b.call(slots, slotProps.value)]), hasAppend && createVNode("div", {
        "key": "append",
        "class": "v-input__append"
      }, [props.appendIcon && createVNode(InputIcon, {
        "key": "append-icon",
        "name": "append"
      }, null), (_c = slots.append) == null ? void 0 : _c.call(slots, slotProps.value)]), hasDetails && createVNode("div", {
        "class": "v-input__details"
      }, [createVNode(VMessages, {
        "id": messagesId.value,
        "active": hasMessages,
        "messages": messages.value
      }, {
        message: slots.message
      }), (_d = slots.details) == null ? void 0 : _d.call(slots, slotProps.value)])]);
    });
    return {
      reset,
      resetValidation,
      validate,
      isValid,
      errorMessages
    };
  }
});
const activeTypes = ["color", "file", "time", "date", "datetime-local", "week", "month"];
const makeVTextFieldProps = propsFactory({
  autofocus: Boolean,
  counter: [Boolean, Number, String],
  counterValue: [Number, Function],
  prefix: String,
  placeholder: String,
  persistentPlaceholder: Boolean,
  persistentCounter: Boolean,
  suffix: String,
  role: String,
  type: {
    type: String,
    default: "text"
  },
  modelModifiers: Object,
  ...makeVInputProps(),
  ...makeVFieldProps()
}, "VTextField");
const VTextField = genericComponent()({
  name: "VTextField",
  directives: {
    Intersect
  },
  inheritAttrs: false,
  props: makeVTextFieldProps(),
  emits: {
    "click:control": (e) => true,
    "mousedown:control": (e) => true,
    "update:focused": (focused) => true,
    "update:modelValue": (val) => true
  },
  setup(props, _ref) {
    let {
      attrs,
      emit,
      slots
    } = _ref;
    const model = useProxiedModel(props, "modelValue");
    const {
      isFocused,
      focus,
      blur
    } = useFocus(props);
    const counterValue = computed(() => {
      var _a;
      return typeof props.counterValue === "function" ? props.counterValue(model.value) : typeof props.counterValue === "number" ? props.counterValue : ((_a = model.value) != null ? _a : "").toString().length;
    });
    const max = computed(() => {
      if (attrs.maxlength)
        return attrs.maxlength;
      if (!props.counter || typeof props.counter !== "number" && typeof props.counter !== "string")
        return void 0;
      return props.counter;
    });
    const isPlainOrUnderlined = computed(() => ["plain", "underlined"].includes(props.variant));
    function onIntersect(isIntersecting, entries) {
      var _a, _b;
      if (!props.autofocus || !isIntersecting)
        return;
      (_b = (_a = entries[0].target) == null ? void 0 : _a.focus) == null ? void 0 : _b.call(_a);
    }
    const vInputRef = ref();
    const vFieldRef = ref();
    const inputRef = ref();
    const isActive = computed(() => activeTypes.includes(props.type) || props.persistentPlaceholder || isFocused.value || props.active);
    function onFocus() {
      var _a;
      if (inputRef.value !== (void 0).activeElement) {
        (_a = inputRef.value) == null ? void 0 : _a.focus();
      }
      if (!isFocused.value)
        focus();
    }
    function onControlMousedown(e) {
      emit("mousedown:control", e);
      if (e.target === inputRef.value)
        return;
      onFocus();
      e.preventDefault();
    }
    function onControlClick(e) {
      onFocus();
      emit("click:control", e);
    }
    function onClear(e) {
      e.stopPropagation();
      onFocus();
      nextTick(() => {
        model.value = null;
        callEvent(props["onClick:clear"], e);
      });
    }
    function onInput(e) {
      var _a;
      const el = e.target;
      model.value = el.value;
      if (((_a = props.modelModifiers) == null ? void 0 : _a.trim) && ["text", "search", "password", "tel", "url"].includes(props.type)) {
        const caretPosition = [el.selectionStart, el.selectionEnd];
        nextTick(() => {
          el.selectionStart = caretPosition[0];
          el.selectionEnd = caretPosition[1];
        });
      }
    }
    useRender(() => {
      const hasCounter = !!(slots.counter || props.counter !== false && props.counter != null);
      const hasDetails = !!(hasCounter || slots.details);
      const [rootAttrs, inputAttrs] = filterInputAttrs(attrs);
      const {
        modelValue: _,
        ...inputProps
      } = VInput.filterProps(props);
      const fieldProps = filterFieldProps(props);
      return createVNode(VInput, mergeProps({
        "ref": vInputRef,
        "modelValue": model.value,
        "onUpdate:modelValue": ($event) => model.value = $event,
        "class": ["v-text-field", {
          "v-text-field--prefixed": props.prefix,
          "v-text-field--suffixed": props.suffix,
          "v-input--plain-underlined": isPlainOrUnderlined.value
        }, props.class],
        "style": props.style
      }, rootAttrs, inputProps, {
        "centerAffix": !isPlainOrUnderlined.value,
        "focused": isFocused.value
      }), {
        ...slots,
        default: (_ref2) => {
          let {
            id,
            isDisabled,
            isDirty,
            isReadonly,
            isValid
          } = _ref2;
          return createVNode(VField, mergeProps({
            "ref": vFieldRef,
            "onMousedown": onControlMousedown,
            "onClick": onControlClick,
            "onClick:clear": onClear,
            "onClick:prependInner": props["onClick:prependInner"],
            "onClick:appendInner": props["onClick:appendInner"],
            "role": props.role
          }, fieldProps, {
            "id": id.value,
            "active": isActive.value || isDirty.value,
            "dirty": isDirty.value || props.dirty,
            "disabled": isDisabled.value,
            "focused": isFocused.value,
            "error": isValid.value === false
          }), {
            ...slots,
            default: (_ref3) => {
              let {
                props: {
                  class: fieldClass,
                  ...slotProps
                }
              } = _ref3;
              const inputNode = withDirectives(createVNode("input", mergeProps({
                "ref": inputRef,
                "value": model.value,
                "onInput": onInput,
                "autofocus": props.autofocus,
                "readonly": isReadonly.value,
                "disabled": isDisabled.value,
                "name": props.name,
                "placeholder": props.placeholder,
                "size": 1,
                "type": props.type,
                "onFocus": onFocus,
                "onBlur": blur
              }, slotProps, inputAttrs), null), [[resolveDirective("intersect"), {
                handler: onIntersect
              }, null, {
                once: true
              }]]);
              return createVNode(Fragment, null, [props.prefix && createVNode("span", {
                "class": "v-text-field__prefix"
              }, [createVNode("span", {
                "class": "v-text-field__prefix__text"
              }, [props.prefix])]), slots.default ? createVNode("div", {
                "class": fieldClass,
                "data-no-activator": ""
              }, [slots.default(), inputNode]) : cloneVNode(inputNode, {
                class: fieldClass
              }), props.suffix && createVNode("span", {
                "class": "v-text-field__suffix"
              }, [createVNode("span", {
                "class": "v-text-field__suffix__text"
              }, [props.suffix])])]);
            }
          });
        },
        details: hasDetails ? (slotProps) => {
          var _a;
          return createVNode(Fragment, null, [(_a = slots.details) == null ? void 0 : _a.call(slots, slotProps), hasCounter && createVNode(Fragment, null, [createVNode("span", null, null), createVNode(VCounter, {
            "active": props.persistentCounter || isFocused.value,
            "value": counterValue.value,
            "max": max.value,
            "disabled": props.disabled
          }, slots.counter)])]);
        } : void 0
      });
    });
    return forwardRefs({}, vInputRef, vFieldRef, inputRef);
  }
});
const _sfc_main$8 = /* @__PURE__ */ defineComponent$1({
  __name: "w-location-find",
  __ssrInlineRender: true,
  setup(__props) {
    const searchedItem = ref("");
    const { cityOrState, refresh } = useLocation();
    const findLocation = () => {
      cityOrState.value = searchedItem.value;
      refresh();
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(VCard, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VCardTitle, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` Find Location `);
                } else {
                  return [
                    createTextVNode(" Find Location ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(VCardSubtitle, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VTextField, {
                    variant: "outlined",
                    density: "compact",
                    modelValue: unref(searchedItem),
                    "onUpdate:modelValue": ($event) => isRef(searchedItem) ? searchedItem.value = $event : null,
                    onKeyup: findLocation
                  }, {
                    "append-inner": withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VIcon, {
                          icon: "mdi-magnify",
                          onClick: findLocation
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VIcon, {
                            icon: "mdi-magnify",
                            onClick: findLocation
                          })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(VTextField, {
                      variant: "outlined",
                      density: "compact",
                      modelValue: unref(searchedItem),
                      "onUpdate:modelValue": ($event) => isRef(searchedItem) ? searchedItem.value = $event : null,
                      onKeyup: withKeys(findLocation, ["enter"])
                    }, {
                      "append-inner": withCtx(() => [
                        createVNode(VIcon, {
                          icon: "mdi-magnify",
                          onClick: findLocation
                        })
                      ]),
                      _: 1
                    }, 8, ["modelValue", "onUpdate:modelValue"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(VCardTitle, null, {
                default: withCtx(() => [
                  createTextVNode(" Find Location ")
                ]),
                _: 1
              }),
              createVNode(VCardSubtitle, null, {
                default: withCtx(() => [
                  createVNode(VTextField, {
                    variant: "outlined",
                    density: "compact",
                    modelValue: unref(searchedItem),
                    "onUpdate:modelValue": ($event) => isRef(searchedItem) ? searchedItem.value = $event : null,
                    onKeyup: withKeys(findLocation, ["enter"])
                  }, {
                    "append-inner": withCtx(() => [
                      createVNode(VIcon, {
                        icon: "mdi-magnify",
                        onClick: findLocation
                      })
                    ]),
                    _: 1
                  }, 8, ["modelValue", "onUpdate:modelValue"])
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/location/w-location-find.vue");
  return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
const ListKey = Symbol.for("vuetify:list");
function createList() {
  const parent = inject(ListKey, {
    hasPrepend: shallowRef(false),
    updateHasPrepend: () => null
  });
  const data = {
    hasPrepend: shallowRef(false),
    updateHasPrepend: (value) => {
      if (value)
        data.hasPrepend.value = value;
    }
  };
  provide(ListKey, data);
  return parent;
}
function useList() {
  return inject(ListKey, null);
}
const independentActiveStrategy = (mandatory) => {
  const strategy = {
    activate: (_ref) => {
      let {
        id,
        value,
        activated
      } = _ref;
      id = toRaw(id);
      if (mandatory && !value && activated.size === 1 && activated.has(id))
        return activated;
      if (value) {
        activated.add(id);
      } else {
        activated.delete(id);
      }
      return activated;
    },
    in: (v, children, parents) => {
      let set = /* @__PURE__ */ new Set();
      if (v != null) {
        for (const id of wrapInArray(v)) {
          set = strategy.activate({
            id,
            value: true,
            activated: new Set(set),
            children,
            parents
          });
        }
      }
      return set;
    },
    out: (v) => {
      return Array.from(v);
    }
  };
  return strategy;
};
const independentSingleActiveStrategy = (mandatory) => {
  const parentStrategy = independentActiveStrategy(mandatory);
  const strategy = {
    activate: (_ref2) => {
      let {
        activated,
        id,
        ...rest
      } = _ref2;
      id = toRaw(id);
      const singleSelected = activated.has(id) ? /* @__PURE__ */ new Set([id]) : /* @__PURE__ */ new Set();
      return parentStrategy.activate({
        ...rest,
        id,
        activated: singleSelected
      });
    },
    in: (v, children, parents) => {
      let set = /* @__PURE__ */ new Set();
      if (v != null) {
        const arr = wrapInArray(v);
        if (arr.length) {
          set = parentStrategy.in(arr.slice(0, 1), children, parents);
        }
      }
      return set;
    },
    out: (v, children, parents) => {
      return parentStrategy.out(v, children, parents);
    }
  };
  return strategy;
};
const leafActiveStrategy = (mandatory) => {
  const parentStrategy = independentActiveStrategy(mandatory);
  const strategy = {
    activate: (_ref3) => {
      let {
        id,
        activated,
        children,
        ...rest
      } = _ref3;
      id = toRaw(id);
      if (children.has(id))
        return activated;
      return parentStrategy.activate({
        id,
        activated,
        children,
        ...rest
      });
    },
    in: parentStrategy.in,
    out: parentStrategy.out
  };
  return strategy;
};
const leafSingleActiveStrategy = (mandatory) => {
  const parentStrategy = independentSingleActiveStrategy(mandatory);
  const strategy = {
    activate: (_ref4) => {
      let {
        id,
        activated,
        children,
        ...rest
      } = _ref4;
      id = toRaw(id);
      if (children.has(id))
        return activated;
      return parentStrategy.activate({
        id,
        activated,
        children,
        ...rest
      });
    },
    in: parentStrategy.in,
    out: parentStrategy.out
  };
  return strategy;
};
const singleOpenStrategy = {
  open: (_ref) => {
    let {
      id,
      value,
      opened,
      parents
    } = _ref;
    if (value) {
      const newOpened = /* @__PURE__ */ new Set();
      newOpened.add(id);
      let parent = parents.get(id);
      while (parent != null) {
        newOpened.add(parent);
        parent = parents.get(parent);
      }
      return newOpened;
    } else {
      opened.delete(id);
      return opened;
    }
  },
  select: () => null
};
const multipleOpenStrategy = {
  open: (_ref2) => {
    let {
      id,
      value,
      opened,
      parents
    } = _ref2;
    if (value) {
      let parent = parents.get(id);
      opened.add(id);
      while (parent != null && parent !== id) {
        opened.add(parent);
        parent = parents.get(parent);
      }
      return opened;
    } else {
      opened.delete(id);
    }
    return opened;
  },
  select: () => null
};
const listOpenStrategy = {
  open: multipleOpenStrategy.open,
  select: (_ref3) => {
    let {
      id,
      value,
      opened,
      parents
    } = _ref3;
    if (!value)
      return opened;
    const path = [];
    let parent = parents.get(id);
    while (parent != null) {
      path.push(parent);
      parent = parents.get(parent);
    }
    return new Set(path);
  }
};
const independentSelectStrategy = (mandatory) => {
  const strategy = {
    select: (_ref) => {
      let {
        id,
        value,
        selected
      } = _ref;
      id = toRaw(id);
      if (mandatory && !value) {
        const on = Array.from(selected.entries()).reduce((arr, _ref2) => {
          let [key, value2] = _ref2;
          if (value2 === "on")
            arr.push(key);
          return arr;
        }, []);
        if (on.length === 1 && on[0] === id)
          return selected;
      }
      selected.set(id, value ? "on" : "off");
      return selected;
    },
    in: (v, children, parents) => {
      let map = /* @__PURE__ */ new Map();
      for (const id of v || []) {
        map = strategy.select({
          id,
          value: true,
          selected: new Map(map),
          children,
          parents
        });
      }
      return map;
    },
    out: (v) => {
      const arr = [];
      for (const [key, value] of v.entries()) {
        if (value === "on")
          arr.push(key);
      }
      return arr;
    }
  };
  return strategy;
};
const independentSingleSelectStrategy = (mandatory) => {
  const parentStrategy = independentSelectStrategy(mandatory);
  const strategy = {
    select: (_ref3) => {
      let {
        selected,
        id,
        ...rest
      } = _ref3;
      id = toRaw(id);
      const singleSelected = selected.has(id) ? /* @__PURE__ */ new Map([[id, selected.get(id)]]) : /* @__PURE__ */ new Map();
      return parentStrategy.select({
        ...rest,
        id,
        selected: singleSelected
      });
    },
    in: (v, children, parents) => {
      let map = /* @__PURE__ */ new Map();
      if (v == null ? void 0 : v.length) {
        map = parentStrategy.in(v.slice(0, 1), children, parents);
      }
      return map;
    },
    out: (v, children, parents) => {
      return parentStrategy.out(v, children, parents);
    }
  };
  return strategy;
};
const leafSelectStrategy = (mandatory) => {
  const parentStrategy = independentSelectStrategy(mandatory);
  const strategy = {
    select: (_ref4) => {
      let {
        id,
        selected,
        children,
        ...rest
      } = _ref4;
      id = toRaw(id);
      if (children.has(id))
        return selected;
      return parentStrategy.select({
        id,
        selected,
        children,
        ...rest
      });
    },
    in: parentStrategy.in,
    out: parentStrategy.out
  };
  return strategy;
};
const leafSingleSelectStrategy = (mandatory) => {
  const parentStrategy = independentSingleSelectStrategy(mandatory);
  const strategy = {
    select: (_ref5) => {
      let {
        id,
        selected,
        children,
        ...rest
      } = _ref5;
      id = toRaw(id);
      if (children.has(id))
        return selected;
      return parentStrategy.select({
        id,
        selected,
        children,
        ...rest
      });
    },
    in: parentStrategy.in,
    out: parentStrategy.out
  };
  return strategy;
};
const classicSelectStrategy = (mandatory) => {
  const strategy = {
    select: (_ref6) => {
      let {
        id,
        value,
        selected,
        children,
        parents
      } = _ref6;
      id = toRaw(id);
      const original = new Map(selected);
      const items = [id];
      while (items.length) {
        const item = items.shift();
        selected.set(item, value ? "on" : "off");
        if (children.has(item)) {
          items.push(...children.get(item));
        }
      }
      let parent = parents.get(id);
      while (parent) {
        const childrenIds = children.get(parent);
        const everySelected = childrenIds.every((cid) => selected.get(cid) === "on");
        const noneSelected = childrenIds.every((cid) => !selected.has(cid) || selected.get(cid) === "off");
        selected.set(parent, everySelected ? "on" : noneSelected ? "off" : "indeterminate");
        parent = parents.get(parent);
      }
      if (mandatory && !value) {
        const on = Array.from(selected.entries()).reduce((arr, _ref7) => {
          let [key, value2] = _ref7;
          if (value2 === "on")
            arr.push(key);
          return arr;
        }, []);
        if (on.length === 0)
          return original;
      }
      return selected;
    },
    in: (v, children, parents) => {
      let map = /* @__PURE__ */ new Map();
      for (const id of v || []) {
        map = strategy.select({
          id,
          value: true,
          selected: new Map(map),
          children,
          parents
        });
      }
      return map;
    },
    out: (v, children) => {
      const arr = [];
      for (const [key, value] of v.entries()) {
        if (value === "on" && !children.has(key))
          arr.push(key);
      }
      return arr;
    }
  };
  return strategy;
};
const VNestedSymbol = Symbol.for("vuetify:nested");
const emptyNested = {
  id: shallowRef(),
  root: {
    register: () => null,
    unregister: () => null,
    parents: ref(/* @__PURE__ */ new Map()),
    children: ref(/* @__PURE__ */ new Map()),
    open: () => null,
    openOnSelect: () => null,
    activate: () => null,
    select: () => null,
    activatable: ref(false),
    selectable: ref(false),
    opened: ref(/* @__PURE__ */ new Set()),
    activated: ref(/* @__PURE__ */ new Set()),
    selected: ref(/* @__PURE__ */ new Map()),
    selectedValues: ref([])
  }
};
const makeNestedProps = propsFactory({
  activatable: Boolean,
  selectable: Boolean,
  activeStrategy: [String, Function, Object],
  selectStrategy: [String, Function, Object],
  openStrategy: [String, Object],
  opened: null,
  activated: null,
  selected: null,
  mandatory: Boolean
}, "nested");
const useNested = (props) => {
  const children = ref(/* @__PURE__ */ new Map());
  const parents = ref(/* @__PURE__ */ new Map());
  const opened = useProxiedModel(props, "opened", props.opened, (v) => new Set(v), (v) => [...v.values()]);
  const activeStrategy = computed(() => {
    if (typeof props.activeStrategy === "object")
      return props.activeStrategy;
    if (typeof props.activeStrategy === "function")
      return props.activeStrategy(props.mandatory);
    switch (props.activeStrategy) {
      case "leaf":
        return leafActiveStrategy(props.mandatory);
      case "single-leaf":
        return leafSingleActiveStrategy(props.mandatory);
      case "independent":
        return independentActiveStrategy(props.mandatory);
      case "single-independent":
      default:
        return independentSingleActiveStrategy(props.mandatory);
    }
  });
  const selectStrategy = computed(() => {
    if (typeof props.selectStrategy === "object")
      return props.selectStrategy;
    if (typeof props.selectStrategy === "function")
      return props.selectStrategy(props.mandatory);
    switch (props.selectStrategy) {
      case "single-leaf":
        return leafSingleSelectStrategy(props.mandatory);
      case "leaf":
        return leafSelectStrategy(props.mandatory);
      case "independent":
        return independentSelectStrategy(props.mandatory);
      case "single-independent":
        return independentSingleSelectStrategy(props.mandatory);
      case "classic":
      default:
        return classicSelectStrategy(props.mandatory);
    }
  });
  const openStrategy = computed(() => {
    if (typeof props.openStrategy === "object")
      return props.openStrategy;
    switch (props.openStrategy) {
      case "list":
        return listOpenStrategy;
      case "single":
        return singleOpenStrategy;
      case "multiple":
      default:
        return multipleOpenStrategy;
    }
  });
  const activated = useProxiedModel(props, "activated", props.activated, (v) => activeStrategy.value.in(v, children.value, parents.value), (v) => activeStrategy.value.out(v, children.value, parents.value));
  const selected = useProxiedModel(props, "selected", props.selected, (v) => selectStrategy.value.in(v, children.value, parents.value), (v) => selectStrategy.value.out(v, children.value, parents.value));
  function getPath(id) {
    const path = [];
    let parent = id;
    while (parent != null) {
      path.unshift(parent);
      parent = parents.value.get(parent);
    }
    return path;
  }
  const vm = getCurrentInstance("nested");
  const nested = {
    id: shallowRef(),
    root: {
      opened,
      activatable: toRef(props, "activatable"),
      selectable: toRef(props, "selectable"),
      activated,
      selected,
      selectedValues: computed(() => {
        const arr = [];
        for (const [key, value] of selected.value.entries()) {
          if (value === "on")
            arr.push(key);
        }
        return arr;
      }),
      register: (id, parentId, isGroup) => {
        parentId && id !== parentId && parents.value.set(id, parentId);
        isGroup && children.value.set(id, []);
        if (parentId != null) {
          children.value.set(parentId, [...children.value.get(parentId) || [], id]);
        }
      },
      unregister: (id) => {
        var _a;
        children.value.delete(id);
        const parent = parents.value.get(id);
        if (parent) {
          const list = (_a = children.value.get(parent)) != null ? _a : [];
          children.value.set(parent, list.filter((child) => child !== id));
        }
        parents.value.delete(id);
        opened.value.delete(id);
      },
      open: (id, value, event) => {
        vm.emit("click:open", {
          id,
          value,
          path: getPath(id),
          event
        });
        const newOpened = openStrategy.value.open({
          id,
          value,
          opened: new Set(opened.value),
          children: children.value,
          parents: parents.value,
          event
        });
        newOpened && (opened.value = newOpened);
      },
      openOnSelect: (id, value, event) => {
        const newOpened = openStrategy.value.select({
          id,
          value,
          selected: new Map(selected.value),
          opened: new Set(opened.value),
          children: children.value,
          parents: parents.value,
          event
        });
        newOpened && (opened.value = newOpened);
      },
      select: (id, value, event) => {
        vm.emit("click:select", {
          id,
          value,
          path: getPath(id),
          event
        });
        const newSelected = selectStrategy.value.select({
          id,
          value,
          selected: new Map(selected.value),
          children: children.value,
          parents: parents.value,
          event
        });
        newSelected && (selected.value = newSelected);
        nested.root.openOnSelect(id, value, event);
      },
      activate: (id, value, event) => {
        if (!props.activatable) {
          return nested.root.select(id, true, event);
        }
        vm.emit("click:activate", {
          id,
          value,
          path: getPath(id),
          event
        });
        const newActivated = activeStrategy.value.activate({
          id,
          value,
          activated: new Set(activated.value),
          children: children.value,
          parents: parents.value,
          event
        });
        newActivated && (activated.value = newActivated);
      },
      children,
      parents
    }
  };
  provide(VNestedSymbol, nested);
  return nested.root;
};
const useNestedItem = (id, isGroup) => {
  const parent = inject(VNestedSymbol, emptyNested);
  const uidSymbol = Symbol(getUid());
  const computedId = computed(() => id.value !== void 0 ? id.value : uidSymbol);
  const item = {
    ...parent,
    id: computedId,
    open: (open, e) => parent.root.open(computedId.value, open, e),
    openOnSelect: (open, e) => parent.root.openOnSelect(computedId.value, open, e),
    isOpen: computed(() => parent.root.opened.value.has(computedId.value)),
    parent: computed(() => parent.root.parents.value.get(computedId.value)),
    activate: (activated, e) => parent.root.activate(computedId.value, activated, e),
    isActivated: computed(() => parent.root.activated.value.has(toRaw(computedId.value))),
    select: (selected, e) => parent.root.select(computedId.value, selected, e),
    isSelected: computed(() => parent.root.selected.value.get(toRaw(computedId.value)) === "on"),
    isIndeterminate: computed(() => parent.root.selected.value.get(computedId.value) === "indeterminate"),
    isLeaf: computed(() => !parent.root.children.value.get(computedId.value)),
    isGroupActivator: parent.isGroupActivator
  };
  !parent.isGroupActivator && parent.root.register(computedId.value, parent.id.value, isGroup);
  isGroup && provide(VNestedSymbol, item);
  return item;
};
const useNestedGroupActivator = () => {
  const parent = inject(VNestedSymbol, emptyNested);
  provide(VNestedSymbol, {
    ...parent,
    isGroupActivator: true
  });
};
const VListGroupActivator = defineComponent({
  name: "VListGroupActivator",
  setup(_, _ref) {
    let {
      slots
    } = _ref;
    useNestedGroupActivator();
    return () => {
      var _a;
      return (_a = slots.default) == null ? void 0 : _a.call(slots);
    };
  }
});
const makeVListGroupProps = propsFactory({
  /* @deprecated */
  activeColor: String,
  baseColor: String,
  color: String,
  collapseIcon: {
    type: IconValue,
    default: "$collapse"
  },
  expandIcon: {
    type: IconValue,
    default: "$expand"
  },
  prependIcon: IconValue,
  appendIcon: IconValue,
  fluid: Boolean,
  subgroup: Boolean,
  title: String,
  value: null,
  ...makeComponentProps(),
  ...makeTagProps()
}, "VListGroup");
const VListGroup = genericComponent()({
  name: "VListGroup",
  props: makeVListGroupProps(),
  setup(props, _ref2) {
    let {
      slots
    } = _ref2;
    const {
      isOpen,
      open,
      id: _id
    } = useNestedItem(toRef(props, "value"), true);
    const id = computed(() => `v-list-group--id-${String(_id.value)}`);
    const list = useList();
    const {
      isBooted
    } = useSsrBoot();
    function onClick(e) {
      e.stopPropagation();
      open(!isOpen.value, e);
    }
    const activatorProps = computed(() => ({
      onClick,
      class: "v-list-group__header",
      id: id.value
    }));
    const toggleIcon = computed(() => isOpen.value ? props.collapseIcon : props.expandIcon);
    const activatorDefaults = computed(() => ({
      VListItem: {
        active: isOpen.value,
        activeColor: props.activeColor,
        baseColor: props.baseColor,
        color: props.color,
        prependIcon: props.prependIcon || props.subgroup && toggleIcon.value,
        appendIcon: props.appendIcon || !props.subgroup && toggleIcon.value,
        title: props.title,
        value: props.value
      }
    }));
    useRender(() => createVNode(props.tag, {
      "class": ["v-list-group", {
        "v-list-group--prepend": list == null ? void 0 : list.hasPrepend.value,
        "v-list-group--fluid": props.fluid,
        "v-list-group--subgroup": props.subgroup,
        "v-list-group--open": isOpen.value
      }, props.class],
      "style": props.style
    }, {
      default: () => [slots.activator && createVNode(VDefaultsProvider, {
        "defaults": activatorDefaults.value
      }, {
        default: () => [createVNode(VListGroupActivator, null, {
          default: () => [slots.activator({
            props: activatorProps.value,
            isOpen: isOpen.value
          })]
        })]
      }), createVNode(MaybeTransition, {
        "transition": {
          component: VExpandTransition
        },
        "disabled": !isBooted.value
      }, {
        default: () => {
          var _a;
          return [withDirectives(createVNode("div", {
            "class": "v-list-group__items",
            "role": "group",
            "aria-labelledby": id.value
          }, [(_a = slots.default) == null ? void 0 : _a.call(slots)]), [[vShow, isOpen.value]])];
        }
      })]
    }));
    return {
      isOpen
    };
  }
});
const makeVListItemSubtitleProps = propsFactory({
  opacity: [Number, String],
  ...makeComponentProps(),
  ...makeTagProps()
}, "VListItemSubtitle");
const VListItemSubtitle = genericComponent()({
  name: "VListItemSubtitle",
  props: makeVListItemSubtitleProps(),
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    useRender(() => createVNode(props.tag, {
      "class": ["v-list-item-subtitle", props.class],
      "style": [{
        "--v-list-item-subtitle-opacity": props.opacity
      }, props.style]
    }, slots));
    return {};
  }
});
const VListItemTitle = createSimpleFunctional("v-list-item-title");
const makeVListItemProps = propsFactory({
  active: {
    type: Boolean,
    default: void 0
  },
  activeClass: String,
  /* @deprecated */
  activeColor: String,
  appendAvatar: String,
  appendIcon: IconValue,
  baseColor: String,
  disabled: Boolean,
  lines: [Boolean, String],
  link: {
    type: Boolean,
    default: void 0
  },
  nav: Boolean,
  prependAvatar: String,
  prependIcon: IconValue,
  ripple: {
    type: [Boolean, Object],
    default: true
  },
  slim: Boolean,
  subtitle: [String, Number],
  title: [String, Number],
  value: null,
  onClick: EventProp(),
  onClickOnce: EventProp(),
  ...makeBorderProps(),
  ...makeComponentProps(),
  ...makeDensityProps(),
  ...makeDimensionProps(),
  ...makeElevationProps(),
  ...makeRoundedProps(),
  ...makeRouterProps(),
  ...makeTagProps(),
  ...makeThemeProps(),
  ...makeVariantProps({
    variant: "text"
  })
}, "VListItem");
const VListItem = genericComponent()({
  name: "VListItem",
  directives: {
    Ripple
  },
  props: makeVListItemProps(),
  emits: {
    click: (e) => true
  },
  setup(props, _ref) {
    let {
      attrs,
      slots,
      emit
    } = _ref;
    const link = useLink(props, attrs);
    const id = computed(() => props.value === void 0 ? link.href.value : props.value);
    const {
      activate,
      isActivated,
      select,
      isSelected,
      isIndeterminate,
      isGroupActivator,
      root,
      parent,
      openOnSelect
    } = useNestedItem(id, false);
    const list = useList();
    const isActive = computed(() => {
      var _a;
      return props.active !== false && (props.active || ((_a = link.isActive) == null ? void 0 : _a.value) || (root.activatable.value ? isActivated.value : isSelected.value));
    });
    const isLink = computed(() => props.link !== false && link.isLink.value);
    const isClickable = computed(() => !props.disabled && props.link !== false && (props.link || link.isClickable.value || !!list && (root.selectable.value || root.activatable.value || props.value != null)));
    const roundedProps = computed(() => props.rounded || props.nav);
    const color = computed(() => {
      var _a;
      return (_a = props.color) != null ? _a : props.activeColor;
    });
    const variantProps = computed(() => {
      var _a;
      return {
        color: isActive.value ? (_a = color.value) != null ? _a : props.baseColor : props.baseColor,
        variant: props.variant
      };
    });
    watch(() => {
      var _a;
      return (_a = link.isActive) == null ? void 0 : _a.value;
    }, (val) => {
      if (val && parent.value != null) {
        root.open(parent.value, true);
      }
      if (val) {
        openOnSelect(val);
      }
    }, {
      immediate: true
    });
    const {
      themeClasses
    } = provideTheme(props);
    const {
      borderClasses
    } = useBorder(props);
    const {
      colorClasses,
      colorStyles,
      variantClasses
    } = useVariant(variantProps);
    const {
      densityClasses
    } = useDensity(props);
    const {
      dimensionStyles
    } = useDimension(props);
    const {
      elevationClasses
    } = useElevation(props);
    const {
      roundedClasses
    } = useRounded(roundedProps);
    const lineClasses = computed(() => props.lines ? `v-list-item--${props.lines}-line` : void 0);
    const slotProps = computed(() => ({
      isActive: isActive.value,
      select,
      isSelected: isSelected.value,
      isIndeterminate: isIndeterminate.value
    }));
    function onClick(e) {
      var _a;
      emit("click", e);
      if (!isClickable.value)
        return;
      (_a = link.navigate) == null ? void 0 : _a.call(link, e);
      if (isGroupActivator)
        return;
      if (root.activatable.value) {
        activate(!isActivated.value, e);
      } else if (root.selectable.value) {
        select(!isSelected.value, e);
      } else if (props.value != null) {
        select(!isSelected.value, e);
      }
    }
    function onKeyDown(e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick(e);
      }
    }
    useRender(() => {
      const Tag = isLink.value ? "a" : props.tag;
      const hasTitle = slots.title || props.title != null;
      const hasSubtitle = slots.subtitle || props.subtitle != null;
      const hasAppendMedia = !!(props.appendAvatar || props.appendIcon);
      const hasAppend = !!(hasAppendMedia || slots.append);
      const hasPrependMedia = !!(props.prependAvatar || props.prependIcon);
      const hasPrepend = !!(hasPrependMedia || slots.prepend);
      list == null ? void 0 : list.updateHasPrepend(hasPrepend);
      if (props.activeColor) {
        deprecate("active-color", ["color", "base-color"]);
      }
      return withDirectives(createVNode(Tag, {
        "class": ["v-list-item", {
          "v-list-item--active": isActive.value,
          "v-list-item--disabled": props.disabled,
          "v-list-item--link": isClickable.value,
          "v-list-item--nav": props.nav,
          "v-list-item--prepend": !hasPrepend && (list == null ? void 0 : list.hasPrepend.value),
          "v-list-item--slim": props.slim,
          [`${props.activeClass}`]: props.activeClass && isActive.value
        }, themeClasses.value, borderClasses.value, colorClasses.value, densityClasses.value, elevationClasses.value, lineClasses.value, roundedClasses.value, variantClasses.value, props.class],
        "style": [colorStyles.value, dimensionStyles.value, props.style],
        "href": link.href.value,
        "tabindex": isClickable.value ? list ? -2 : 0 : void 0,
        "onClick": onClick,
        "onKeydown": isClickable.value && !isLink.value && onKeyDown
      }, {
        default: () => {
          var _a;
          return [genOverlays(isClickable.value || isActive.value, "v-list-item"), hasPrepend && createVNode("div", {
            "key": "prepend",
            "class": "v-list-item__prepend"
          }, [!slots.prepend ? createVNode(Fragment, null, [props.prependAvatar && createVNode(VAvatar, {
            "key": "prepend-avatar",
            "density": props.density,
            "image": props.prependAvatar
          }, null), props.prependIcon && createVNode(VIcon, {
            "key": "prepend-icon",
            "density": props.density,
            "icon": props.prependIcon
          }, null)]) : createVNode(VDefaultsProvider, {
            "key": "prepend-defaults",
            "disabled": !hasPrependMedia,
            "defaults": {
              VAvatar: {
                density: props.density,
                image: props.prependAvatar
              },
              VIcon: {
                density: props.density,
                icon: props.prependIcon
              },
              VListItemAction: {
                start: true
              }
            }
          }, {
            default: () => {
              var _a2;
              return [(_a2 = slots.prepend) == null ? void 0 : _a2.call(slots, slotProps.value)];
            }
          }), createVNode("div", {
            "class": "v-list-item__spacer"
          }, null)]), createVNode("div", {
            "class": "v-list-item__content",
            "data-no-activator": ""
          }, [hasTitle && createVNode(VListItemTitle, {
            "key": "title"
          }, {
            default: () => {
              var _a3;
              var _a2;
              return [(_a3 = (_a2 = slots.title) == null ? void 0 : _a2.call(slots, {
                title: props.title
              })) != null ? _a3 : props.title];
            }
          }), hasSubtitle && createVNode(VListItemSubtitle, {
            "key": "subtitle"
          }, {
            default: () => {
              var _a3;
              var _a2;
              return [(_a3 = (_a2 = slots.subtitle) == null ? void 0 : _a2.call(slots, {
                subtitle: props.subtitle
              })) != null ? _a3 : props.subtitle];
            }
          }), (_a = slots.default) == null ? void 0 : _a.call(slots, slotProps.value)]), hasAppend && createVNode("div", {
            "key": "append",
            "class": "v-list-item__append"
          }, [!slots.append ? createVNode(Fragment, null, [props.appendIcon && createVNode(VIcon, {
            "key": "append-icon",
            "density": props.density,
            "icon": props.appendIcon
          }, null), props.appendAvatar && createVNode(VAvatar, {
            "key": "append-avatar",
            "density": props.density,
            "image": props.appendAvatar
          }, null)]) : createVNode(VDefaultsProvider, {
            "key": "append-defaults",
            "disabled": !hasAppendMedia,
            "defaults": {
              VAvatar: {
                density: props.density,
                image: props.appendAvatar
              },
              VIcon: {
                density: props.density,
                icon: props.appendIcon
              },
              VListItemAction: {
                end: true
              }
            }
          }, {
            default: () => {
              var _a2;
              return [(_a2 = slots.append) == null ? void 0 : _a2.call(slots, slotProps.value)];
            }
          }), createVNode("div", {
            "class": "v-list-item__spacer"
          }, null)])];
        }
      }), [[resolveDirective("ripple"), isClickable.value && props.ripple]]);
    });
    return {
      activate,
      isActivated,
      isGroupActivator,
      isSelected,
      list,
      select
    };
  }
});
const makeVListSubheaderProps = propsFactory({
  color: String,
  inset: Boolean,
  sticky: Boolean,
  title: String,
  ...makeComponentProps(),
  ...makeTagProps()
}, "VListSubheader");
const VListSubheader = genericComponent()({
  name: "VListSubheader",
  props: makeVListSubheaderProps(),
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    const {
      textColorClasses,
      textColorStyles
    } = useTextColor(toRef(props, "color"));
    useRender(() => {
      const hasText = !!(slots.default || props.title);
      return createVNode(props.tag, {
        "class": ["v-list-subheader", {
          "v-list-subheader--inset": props.inset,
          "v-list-subheader--sticky": props.sticky
        }, textColorClasses.value, props.class],
        "style": [{
          textColorStyles
        }, props.style]
      }, {
        default: () => {
          var _a2;
          var _a;
          return [hasText && createVNode("div", {
            "class": "v-list-subheader__text"
          }, [(_a2 = (_a = slots.default) == null ? void 0 : _a.call(slots)) != null ? _a2 : props.title])];
        }
      });
    });
    return {};
  }
});
const makeVDividerProps = propsFactory({
  color: String,
  inset: Boolean,
  length: [Number, String],
  opacity: [Number, String],
  thickness: [Number, String],
  vertical: Boolean,
  ...makeComponentProps(),
  ...makeThemeProps()
}, "VDivider");
const VDivider = genericComponent()({
  name: "VDivider",
  props: makeVDividerProps(),
  setup(props, _ref) {
    let {
      attrs,
      slots
    } = _ref;
    const {
      themeClasses
    } = provideTheme(props);
    const {
      textColorClasses,
      textColorStyles
    } = useTextColor(toRef(props, "color"));
    const dividerStyles = computed(() => {
      const styles = {};
      if (props.length) {
        styles[props.vertical ? "height" : "width"] = convertToUnit(props.length);
      }
      if (props.thickness) {
        styles[props.vertical ? "borderRightWidth" : "borderTopWidth"] = convertToUnit(props.thickness);
      }
      return styles;
    });
    useRender(() => {
      const divider = createVNode("hr", {
        "class": [{
          "v-divider": true,
          "v-divider--inset": props.inset,
          "v-divider--vertical": props.vertical
        }, themeClasses.value, textColorClasses.value, props.class],
        "style": [dividerStyles.value, textColorStyles.value, {
          "--v-border-opacity": props.opacity
        }, props.style],
        "aria-orientation": !attrs.role || attrs.role === "separator" ? props.vertical ? "vertical" : "horizontal" : void 0,
        "role": `${attrs.role || "separator"}`
      }, null);
      if (!slots.default)
        return divider;
      return createVNode("div", {
        "class": ["v-divider__wrapper", {
          "v-divider__wrapper--vertical": props.vertical,
          "v-divider__wrapper--inset": props.inset
        }]
      }, [divider, createVNode("div", {
        "class": "v-divider__content"
      }, [slots.default()]), divider]);
    });
    return {};
  }
});
const makeVListChildrenProps = propsFactory({
  items: Array,
  returnObject: Boolean
}, "VListChildren");
const VListChildren = genericComponent()({
  name: "VListChildren",
  props: makeVListChildrenProps(),
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    createList();
    return () => {
      var _a2;
      var _a, _b;
      return (_a2 = (_a = slots.default) == null ? void 0 : _a.call(slots)) != null ? _a2 : (_b = props.items) == null ? void 0 : _b.map((_ref2) => {
        var _a3, _b3;
        var _a22, _b2;
        let {
          children,
          props: itemProps,
          type,
          raw: item
        } = _ref2;
        if (type === "divider") {
          return (_a3 = (_a22 = slots.divider) == null ? void 0 : _a22.call(slots, {
            props: itemProps
          })) != null ? _a3 : createVNode(VDivider, itemProps, null);
        }
        if (type === "subheader") {
          return (_b3 = (_b2 = slots.subheader) == null ? void 0 : _b2.call(slots, {
            props: itemProps
          })) != null ? _b3 : createVNode(VListSubheader, itemProps, null);
        }
        const slotsWithItem = {
          subtitle: slots.subtitle ? (slotProps) => {
            var _a32;
            return (_a32 = slots.subtitle) == null ? void 0 : _a32.call(slots, {
              ...slotProps,
              item
            });
          } : void 0,
          prepend: slots.prepend ? (slotProps) => {
            var _a32;
            return (_a32 = slots.prepend) == null ? void 0 : _a32.call(slots, {
              ...slotProps,
              item
            });
          } : void 0,
          append: slots.append ? (slotProps) => {
            var _a32;
            return (_a32 = slots.append) == null ? void 0 : _a32.call(slots, {
              ...slotProps,
              item
            });
          } : void 0,
          title: slots.title ? (slotProps) => {
            var _a32;
            return (_a32 = slots.title) == null ? void 0 : _a32.call(slots, {
              ...slotProps,
              item
            });
          } : void 0
        };
        const listGroupProps = VListGroup.filterProps(itemProps);
        return children ? createVNode(VListGroup, mergeProps({
          "value": itemProps == null ? void 0 : itemProps.value
        }, listGroupProps), {
          activator: (_ref3) => {
            let {
              props: activatorProps
            } = _ref3;
            const listItemProps = {
              ...itemProps,
              ...activatorProps,
              value: props.returnObject ? item : itemProps.value
            };
            return slots.header ? slots.header({
              props: listItemProps
            }) : createVNode(VListItem, listItemProps, slotsWithItem);
          },
          default: () => createVNode(VListChildren, {
            "items": children,
            "returnObject": props.returnObject
          }, slots)
        }) : slots.item ? slots.item({
          props: itemProps
        }) : createVNode(VListItem, mergeProps(itemProps, {
          "value": props.returnObject ? item : itemProps.value
        }), slotsWithItem);
      });
    };
  }
});
const makeItemsProps = propsFactory({
  items: {
    type: Array,
    default: () => []
  },
  itemTitle: {
    type: [String, Array, Function],
    default: "title"
  },
  itemValue: {
    type: [String, Array, Function],
    default: "value"
  },
  itemChildren: {
    type: [Boolean, String, Array, Function],
    default: "children"
  },
  itemProps: {
    type: [Boolean, String, Array, Function],
    default: "props"
  },
  returnObject: Boolean,
  valueComparator: {
    type: Function,
    default: deepEqual
  }
}, "list-items");
function isPrimitive(value) {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}
function transformItem(props, item) {
  const type = getPropertyFromItem(item, props.itemType, "item");
  const title = isPrimitive(item) ? item : getPropertyFromItem(item, props.itemTitle);
  const value = getPropertyFromItem(item, props.itemValue, void 0);
  const children = getPropertyFromItem(item, props.itemChildren);
  const itemProps = props.itemProps === true ? omit(item, ["children"]) : getPropertyFromItem(item, props.itemProps);
  const _props = {
    title,
    value,
    ...itemProps
  };
  return {
    type,
    title: _props.title,
    value: _props.value,
    props: _props,
    children: type === "item" && children ? transformItems(props, children) : void 0,
    raw: item
  };
}
function transformItems(props, items) {
  const array = [];
  for (const item of items) {
    array.push(transformItem(props, item));
  }
  return array;
}
function useListItems(props) {
  const items = computed(() => transformItems(props, props.items));
  return {
    items
  };
}
const makeVListProps = propsFactory({
  baseColor: String,
  /* @deprecated */
  activeColor: String,
  activeClass: String,
  bgColor: String,
  disabled: Boolean,
  expandIcon: String,
  collapseIcon: String,
  lines: {
    type: [Boolean, String],
    default: "one"
  },
  slim: Boolean,
  nav: Boolean,
  "onClick:open": EventProp(),
  "onClick:select": EventProp(),
  "onUpdate:opened": EventProp(),
  ...makeNestedProps({
    selectStrategy: "single-leaf",
    openStrategy: "list"
  }),
  ...makeBorderProps(),
  ...makeComponentProps(),
  ...makeDensityProps(),
  ...makeDimensionProps(),
  ...makeElevationProps(),
  itemType: {
    type: String,
    default: "type"
  },
  ...makeItemsProps(),
  ...makeRoundedProps(),
  ...makeTagProps(),
  ...makeThemeProps(),
  ...makeVariantProps({
    variant: "text"
  })
}, "VList");
const VList = genericComponent()({
  name: "VList",
  props: makeVListProps(),
  emits: {
    "update:selected": (value) => true,
    "update:activated": (value) => true,
    "update:opened": (value) => true,
    "click:open": (value) => true,
    "click:activate": (value) => true,
    "click:select": (value) => true
  },
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    const {
      items
    } = useListItems(props);
    const {
      themeClasses
    } = provideTheme(props);
    const {
      backgroundColorClasses,
      backgroundColorStyles
    } = useBackgroundColor(toRef(props, "bgColor"));
    const {
      borderClasses
    } = useBorder(props);
    const {
      densityClasses
    } = useDensity(props);
    const {
      dimensionStyles
    } = useDimension(props);
    const {
      elevationClasses
    } = useElevation(props);
    const {
      roundedClasses
    } = useRounded(props);
    const {
      children,
      open,
      parents,
      select
    } = useNested(props);
    const lineClasses = computed(() => props.lines ? `v-list--${props.lines}-line` : void 0);
    const activeColor = toRef(props, "activeColor");
    const baseColor = toRef(props, "baseColor");
    const color = toRef(props, "color");
    createList();
    provideDefaults({
      VListGroup: {
        activeColor,
        baseColor,
        color,
        expandIcon: toRef(props, "expandIcon"),
        collapseIcon: toRef(props, "collapseIcon")
      },
      VListItem: {
        activeClass: toRef(props, "activeClass"),
        activeColor,
        baseColor,
        color,
        density: toRef(props, "density"),
        disabled: toRef(props, "disabled"),
        lines: toRef(props, "lines"),
        nav: toRef(props, "nav"),
        slim: toRef(props, "slim"),
        variant: toRef(props, "variant")
      }
    });
    const isFocused = shallowRef(false);
    const contentRef = ref();
    function onFocusin(e) {
      isFocused.value = true;
    }
    function onFocusout(e) {
      isFocused.value = false;
    }
    function onFocus(e) {
      var _a;
      if (!isFocused.value && !(e.relatedTarget && ((_a = contentRef.value) == null ? void 0 : _a.contains(e.relatedTarget))))
        focus();
    }
    function onKeydown(e) {
      const target = e.target;
      if (!contentRef.value || ["INPUT", "TEXTAREA"].includes(target.tagName))
        return;
      if (e.key === "ArrowDown") {
        focus("next");
      } else if (e.key === "ArrowUp") {
        focus("prev");
      } else if (e.key === "Home") {
        focus("first");
      } else if (e.key === "End") {
        focus("last");
      } else {
        return;
      }
      e.preventDefault();
    }
    function onMousedown(e) {
      isFocused.value = true;
    }
    function focus(location) {
      if (contentRef.value) {
        return focusChild(contentRef.value, location);
      }
    }
    useRender(() => {
      return createVNode(props.tag, {
        "ref": contentRef,
        "class": ["v-list", {
          "v-list--disabled": props.disabled,
          "v-list--nav": props.nav,
          "v-list--slim": props.slim
        }, themeClasses.value, backgroundColorClasses.value, borderClasses.value, densityClasses.value, elevationClasses.value, lineClasses.value, roundedClasses.value, props.class],
        "style": [backgroundColorStyles.value, dimensionStyles.value, props.style],
        "tabindex": props.disabled || isFocused.value ? -1 : 0,
        "role": "listbox",
        "aria-activedescendant": void 0,
        "onFocusin": onFocusin,
        "onFocusout": onFocusout,
        "onFocus": onFocus,
        "onKeydown": onKeydown,
        "onMousedown": onMousedown
      }, {
        default: () => [createVNode(VListChildren, {
          "items": items.value,
          "returnObject": props.returnObject
        }, slots)]
      });
    });
    return {
      open,
      select,
      focus,
      children,
      parents
    };
  }
});
const _sfc_main$7 = /* @__PURE__ */ defineComponent$1({
  __name: "w-location-list",
  __ssrInlineRender: true,
  setup(__props) {
    const { data, status, setAddressDetail } = useLocation();
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(VCard, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(data)) {
              _push2(ssrRenderComponent(VCardTitle, null, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` Searched Results `);
                  } else {
                    return [
                      createTextVNode(" Searched Results ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(ssrRenderComponent(VCardTitle, null, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` Recent Locations `);
                  } else {
                    return [
                      createTextVNode(" Recent Locations ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            }
            _push2(ssrRenderComponent(VCard, {
              class: "px-2",
              variant: "text"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  if (unref(status) == "success") {
                    _push3(ssrRenderComponent(VList, { nav: "" }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`<!--[-->`);
                          ssrRenderList(unref(data), (item, index) => {
                            _push4(ssrRenderComponent(VCard, {
                              key: index,
                              variant: "outlined",
                              link: "",
                              class: "py-2 mb-2",
                              onClick: ($event) => unref(setAddressDetail)(item)
                            }, {
                              default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(ssrRenderComponent(VListItem, { variant: "flat" }, {
                                    default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                      if (_push6) {
                                        _push6(ssrRenderComponent(VListItemTitle, null, {
                                          default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                            if (_push7) {
                                              _push7(`${ssrInterpolate(item["display_name"])}`);
                                            } else {
                                              return [
                                                createTextVNode(toDisplayString(item["display_name"]), 1)
                                              ];
                                            }
                                          }),
                                          _: 2
                                        }, _parent6, _scopeId5));
                                      } else {
                                        return [
                                          createVNode(VListItemTitle, null, {
                                            default: withCtx(() => [
                                              createTextVNode(toDisplayString(item["display_name"]), 1)
                                            ]),
                                            _: 2
                                          }, 1024)
                                        ];
                                      }
                                    }),
                                    _: 2
                                  }, _parent5, _scopeId4));
                                } else {
                                  return [
                                    createVNode(VListItem, { variant: "flat" }, {
                                      default: withCtx(() => [
                                        createVNode(VListItemTitle, null, {
                                          default: withCtx(() => [
                                            createTextVNode(toDisplayString(item["display_name"]), 1)
                                          ]),
                                          _: 2
                                        }, 1024)
                                      ]),
                                      _: 2
                                    }, 1024)
                                  ];
                                }
                              }),
                              _: 2
                            }, _parent4, _scopeId3));
                          });
                          _push4(`<!--]-->`);
                        } else {
                          return [
                            (openBlock(true), createBlock(Fragment, null, renderList(unref(data), (item, index) => {
                              return openBlock(), createBlock(VCard, {
                                key: index,
                                variant: "outlined",
                                link: "",
                                class: "py-2 mb-2",
                                onClick: ($event) => unref(setAddressDetail)(item)
                              }, {
                                default: withCtx(() => [
                                  createVNode(VListItem, { variant: "flat" }, {
                                    default: withCtx(() => [
                                      createVNode(VListItemTitle, null, {
                                        default: withCtx(() => [
                                          createTextVNode(toDisplayString(item["display_name"]), 1)
                                        ]),
                                        _: 2
                                      }, 1024)
                                    ]),
                                    _: 2
                                  }, 1024)
                                ]),
                                _: 2
                              }, 1032, ["onClick"]);
                            }), 128))
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                  } else {
                    _push3(`<!---->`);
                  }
                } else {
                  return [
                    unref(status) == "success" ? (openBlock(), createBlock(VList, {
                      key: 0,
                      nav: ""
                    }, {
                      default: withCtx(() => [
                        (openBlock(true), createBlock(Fragment, null, renderList(unref(data), (item, index) => {
                          return openBlock(), createBlock(VCard, {
                            key: index,
                            variant: "outlined",
                            link: "",
                            class: "py-2 mb-2",
                            onClick: ($event) => unref(setAddressDetail)(item)
                          }, {
                            default: withCtx(() => [
                              createVNode(VListItem, { variant: "flat" }, {
                                default: withCtx(() => [
                                  createVNode(VListItemTitle, null, {
                                    default: withCtx(() => [
                                      createTextVNode(toDisplayString(item["display_name"]), 1)
                                    ]),
                                    _: 2
                                  }, 1024)
                                ]),
                                _: 2
                              }, 1024)
                            ]),
                            _: 2
                          }, 1032, ["onClick"]);
                        }), 128))
                      ]),
                      _: 1
                    })) : createCommentVNode("", true)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              unref(data) ? (openBlock(), createBlock(VCardTitle, { key: 0 }, {
                default: withCtx(() => [
                  createTextVNode(" Searched Results ")
                ]),
                _: 1
              })) : (openBlock(), createBlock(VCardTitle, { key: 1 }, {
                default: withCtx(() => [
                  createTextVNode(" Recent Locations ")
                ]),
                _: 1
              })),
              createVNode(VCard, {
                class: "px-2",
                variant: "text"
              }, {
                default: withCtx(() => [
                  unref(status) == "success" ? (openBlock(), createBlock(VList, {
                    key: 0,
                    nav: ""
                  }, {
                    default: withCtx(() => [
                      (openBlock(true), createBlock(Fragment, null, renderList(unref(data), (item, index) => {
                        return openBlock(), createBlock(VCard, {
                          key: index,
                          variant: "outlined",
                          link: "",
                          class: "py-2 mb-2",
                          onClick: ($event) => unref(setAddressDetail)(item)
                        }, {
                          default: withCtx(() => [
                            createVNode(VListItem, { variant: "flat" }, {
                              default: withCtx(() => [
                                createVNode(VListItemTitle, null, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(item["display_name"]), 1)
                                  ]),
                                  _: 2
                                }, 1024)
                              ]),
                              _: 2
                            }, 1024)
                          ]),
                          _: 2
                        }, 1032, ["onClick"]);
                      }), 128))
                    ]),
                    _: 1
                  })) : createCommentVNode("", true)
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/location/w-location-list.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
const _sfc_main$6 = /* @__PURE__ */ defineComponent$1({
  __name: "w-location",
  __ssrInlineRender: true,
  setup(__props) {
    const { selectedAddress, countryCode, getCurrentLocationWeather } = useLocation();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LocationWLocationFind = _sfc_main$8;
      const _component_LocationWLocationList = _sfc_main$7;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(VCard, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VCardItem, { class: "d-flex flex-column align-center" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  if (unref(countryCode)) {
                    _push3(ssrRenderComponent(VImg, {
                      src: `/flags/${unref(countryCode).toLowerCase()}.svg`,
                      alt: "Country flag",
                      height: "50px",
                      width: "auto",
                      block: ""
                    }, null, _parent3, _scopeId2));
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(ssrRenderComponent(VCardTitle, null, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`${ssrInterpolate(unref(selectedAddress))}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(unref(selectedAddress)), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    unref(countryCode) ? (openBlock(), createBlock(VImg, {
                      key: 0,
                      src: `/flags/${unref(countryCode).toLowerCase()}.svg`,
                      alt: "Country flag",
                      height: "50px",
                      width: "auto",
                      block: ""
                    }, null, 8, ["src"])) : createCommentVNode("", true),
                    createVNode(VCardTitle, null, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(unref(selectedAddress)), 1)
                      ]),
                      _: 1
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(VCardText, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VBtn, {
                    variant: "outlined",
                    block: "",
                    onClick: unref(getCurrentLocationWeather)
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(` Current Location `);
                      } else {
                        return [
                          createTextVNode(" Current Location ")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(VBtn, {
                      variant: "outlined",
                      block: "",
                      onClick: unref(getCurrentLocationWeather)
                    }, {
                      default: withCtx(() => [
                        createTextVNode(" Current Location ")
                      ]),
                      _: 1
                    }, 8, ["onClick"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(VCardItem, { class: "d-flex flex-column align-center" }, {
                default: withCtx(() => [
                  unref(countryCode) ? (openBlock(), createBlock(VImg, {
                    key: 0,
                    src: `/flags/${unref(countryCode).toLowerCase()}.svg`,
                    alt: "Country flag",
                    height: "50px",
                    width: "auto",
                    block: ""
                  }, null, 8, ["src"])) : createCommentVNode("", true),
                  createVNode(VCardTitle, null, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(selectedAddress)), 1)
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }),
              createVNode(VCardText, null, {
                default: withCtx(() => [
                  createVNode(VBtn, {
                    variant: "outlined",
                    block: "",
                    onClick: unref(getCurrentLocationWeather)
                  }, {
                    default: withCtx(() => [
                      createTextVNode(" Current Location ")
                    ]),
                    _: 1
                  }, 8, ["onClick"])
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_LocationWLocationFind, null, null, _parent));
      _push(ssrRenderComponent(_component_LocationWLocationList, null, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/location/w-location.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const makeVContainerProps = propsFactory({
  fluid: {
    type: Boolean,
    default: false
  },
  ...makeComponentProps(),
  ...makeTagProps()
}, "VContainer");
const VContainer = genericComponent()({
  name: "VContainer",
  props: makeVContainerProps(),
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    const {
      rtlClasses
    } = useRtl();
    useRender(() => createVNode(props.tag, {
      "class": ["v-container", {
        "v-container--fluid": props.fluid
      }, rtlClasses.value, props.class],
      "style": props.style
    }, slots));
    return {};
  }
});
const breakpointProps = (() => {
  return breakpoints.reduce((props, val) => {
    props[val] = {
      type: [Boolean, String, Number],
      default: false
    };
    return props;
  }, {});
})();
const offsetProps = (() => {
  return breakpoints.reduce((props, val) => {
    const offsetKey = "offset" + capitalize(val);
    props[offsetKey] = {
      type: [String, Number],
      default: null
    };
    return props;
  }, {});
})();
const orderProps = (() => {
  return breakpoints.reduce((props, val) => {
    const orderKey = "order" + capitalize(val);
    props[orderKey] = {
      type: [String, Number],
      default: null
    };
    return props;
  }, {});
})();
const propMap$1 = {
  col: Object.keys(breakpointProps),
  offset: Object.keys(offsetProps),
  order: Object.keys(orderProps)
};
function breakpointClass$1(type, prop, val) {
  let className = type;
  if (val == null || val === false) {
    return void 0;
  }
  if (prop) {
    const breakpoint = prop.replace(type, "");
    className += `-${breakpoint}`;
  }
  if (type === "col") {
    className = "v-" + className;
  }
  if (type === "col" && (val === "" || val === true)) {
    return className.toLowerCase();
  }
  className += `-${val}`;
  return className.toLowerCase();
}
const ALIGN_SELF_VALUES = ["auto", "start", "end", "center", "baseline", "stretch"];
const makeVColProps = propsFactory({
  cols: {
    type: [Boolean, String, Number],
    default: false
  },
  ...breakpointProps,
  offset: {
    type: [String, Number],
    default: null
  },
  ...offsetProps,
  order: {
    type: [String, Number],
    default: null
  },
  ...orderProps,
  alignSelf: {
    type: String,
    default: null,
    validator: (str) => ALIGN_SELF_VALUES.includes(str)
  },
  ...makeComponentProps(),
  ...makeTagProps()
}, "VCol");
const VCol = genericComponent()({
  name: "VCol",
  props: makeVColProps(),
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    const classes = computed(() => {
      const classList = [];
      let type;
      for (type in propMap$1) {
        propMap$1[type].forEach((prop) => {
          const value = props[prop];
          const className = breakpointClass$1(type, prop, value);
          if (className)
            classList.push(className);
        });
      }
      const hasColClasses = classList.some((className) => className.startsWith("v-col-"));
      classList.push({
        // Default to .v-col if no other col-{bp}-* classes generated nor `cols` specified.
        "v-col": !hasColClasses || !props.cols,
        [`v-col-${props.cols}`]: props.cols,
        [`offset-${props.offset}`]: props.offset,
        [`order-${props.order}`]: props.order,
        [`align-self-${props.alignSelf}`]: props.alignSelf
      });
      return classList;
    });
    return () => {
      var _a;
      return h(props.tag, {
        class: [classes.value, props.class],
        style: props.style
      }, (_a = slots.default) == null ? void 0 : _a.call(slots));
    };
  }
});
const ALIGNMENT = ["start", "end", "center"];
const SPACE = ["space-between", "space-around", "space-evenly"];
function makeRowProps(prefix, def) {
  return breakpoints.reduce((props, val) => {
    const prefixKey = prefix + capitalize(val);
    props[prefixKey] = def();
    return props;
  }, {});
}
const ALIGN_VALUES = [...ALIGNMENT, "baseline", "stretch"];
const alignValidator = (str) => ALIGN_VALUES.includes(str);
const alignProps = makeRowProps("align", () => ({
  type: String,
  default: null,
  validator: alignValidator
}));
const JUSTIFY_VALUES = [...ALIGNMENT, ...SPACE];
const justifyValidator = (str) => JUSTIFY_VALUES.includes(str);
const justifyProps = makeRowProps("justify", () => ({
  type: String,
  default: null,
  validator: justifyValidator
}));
const ALIGN_CONTENT_VALUES = [...ALIGNMENT, ...SPACE, "stretch"];
const alignContentValidator = (str) => ALIGN_CONTENT_VALUES.includes(str);
const alignContentProps = makeRowProps("alignContent", () => ({
  type: String,
  default: null,
  validator: alignContentValidator
}));
const propMap = {
  align: Object.keys(alignProps),
  justify: Object.keys(justifyProps),
  alignContent: Object.keys(alignContentProps)
};
const classMap = {
  align: "align",
  justify: "justify",
  alignContent: "align-content"
};
function breakpointClass(type, prop, val) {
  let className = classMap[type];
  if (val == null) {
    return void 0;
  }
  if (prop) {
    const breakpoint = prop.replace(type, "");
    className += `-${breakpoint}`;
  }
  className += `-${val}`;
  return className.toLowerCase();
}
const makeVRowProps = propsFactory({
  dense: Boolean,
  noGutters: Boolean,
  align: {
    type: String,
    default: null,
    validator: alignValidator
  },
  ...alignProps,
  justify: {
    type: String,
    default: null,
    validator: justifyValidator
  },
  ...justifyProps,
  alignContent: {
    type: String,
    default: null,
    validator: alignContentValidator
  },
  ...alignContentProps,
  ...makeComponentProps(),
  ...makeTagProps()
}, "VRow");
const VRow = genericComponent()({
  name: "VRow",
  props: makeVRowProps(),
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    const classes = computed(() => {
      const classList = [];
      let type;
      for (type in propMap) {
        propMap[type].forEach((prop) => {
          const value = props[prop];
          const className = breakpointClass(type, prop, value);
          if (className)
            classList.push(className);
        });
      }
      classList.push({
        "v-row--no-gutters": props.noGutters,
        "v-row--dense": props.dense,
        [`align-${props.align}`]: props.align,
        [`justify-${props.justify}`]: props.justify,
        [`align-content-${props.alignContent}`]: props.alignContent
      });
      return classList;
    });
    return () => {
      var _a;
      return h(props.tag, {
        class: ["v-row", classes.value, props.class],
        style: props.style
      }, (_a = slots.default) == null ? void 0 : _a.call(slots));
    };
  }
});
const _sfc_main$5 = /* @__PURE__ */ defineComponent$1({
  __name: "w-widget",
  __ssrInlineRender: true,
  setup(__props) {
    const { data, getCurrentLocaleDateString, getValue, getIcon, getUnit } = useForecast();
    return (_ctx, _push, _parent, _attrs) => {
      if (unref(data)) {
        _push(`<div${ssrRenderAttrs(_attrs)}>`);
        _push(ssrRenderComponent(VCard, {
          elevation: "0",
          variant: "text"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(VCardItem, null, {
                prepend: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(VIcon, {
                      icon: unref(getValue)("Weather Condition", "icon")
                    }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(VIcon, {
                        icon: unref(getValue)("Weather Condition", "icon")
                      }, null, 8, ["icon"])
                    ];
                  }
                }),
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(VCardTitle, null, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(` Current Weather `);
                        } else {
                          return [
                            createTextVNode(" Current Weather ")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(VCardSubtitle, null, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        var _a, _b, _c, _d;
                        if (_push4) {
                          _push4(`${ssrInterpolate(unref(getCurrentLocaleDateString)((_b = (_a = unref(data)) == null ? void 0 : _a.current) == null ? void 0 : _b.time))}`);
                        } else {
                          return [
                            createTextVNode(toDisplayString(unref(getCurrentLocaleDateString)((_d = (_c = unref(data)) == null ? void 0 : _c.current) == null ? void 0 : _d.time)), 1)
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(VCardTitle, null, {
                        default: withCtx(() => [
                          createTextVNode(" Current Weather ")
                        ]),
                        _: 1
                      }),
                      createVNode(VCardSubtitle, null, {
                        default: withCtx(() => {
                          var _a, _b;
                          return [
                            createTextVNode(toDisplayString(unref(getCurrentLocaleDateString)((_b = (_a = unref(data)) == null ? void 0 : _a.current) == null ? void 0 : _b.time)), 1)
                          ];
                        }),
                        _: 1
                      })
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(VCardText, { class: "" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(VRow, {
                      "no-gutters": "",
                      class: "d-flex flex-column align-center"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(VCol, { class: "d-flex justify-center" }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(ssrRenderComponent(VIcon, {
                                  icon: unref(getValue)("Weather Condition", "icon"),
                                  size: "128"
                                }, null, _parent5, _scopeId4));
                              } else {
                                return [
                                  createVNode(VIcon, {
                                    icon: unref(getValue)("Weather Condition", "icon"),
                                    size: "128"
                                  }, null, 8, ["icon"])
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(ssrRenderComponent(VCol, { class: "d-flex justify-center" }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`<h1${_scopeId4}>${ssrInterpolate(unref(getValue)("Weather Condition", "description"))}</h1>`);
                              } else {
                                return [
                                  createVNode("h1", null, toDisplayString(unref(getValue)("Weather Condition", "description")), 1)
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(ssrRenderComponent(VCol, { class: "d-flex justify-center" }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`<h2${_scopeId4}><span${_scopeId4}><strong${_scopeId4}>${ssrInterpolate(unref(getValue)("Temperature", "description"))}<sup${_scopeId4}>${ssrInterpolate(unref(getUnit)("Temperature"))}</sup></strong> ${ssrInterpolate("  ")} Feels like: ${ssrInterpolate("  ")} <strong${_scopeId4}>${ssrInterpolate(unref(getValue)("Feels Like", ""))}<sup${_scopeId4}>${ssrInterpolate(unref(getUnit)("Feels Like"))}</sup></strong></span></h2>`);
                              } else {
                                return [
                                  createVNode("h2", null, [
                                    createVNode("span", null, [
                                      createVNode("strong", null, [
                                        createTextVNode(toDisplayString(unref(getValue)("Temperature", "description")), 1),
                                        createVNode("sup", null, toDisplayString(unref(getUnit)("Temperature")), 1)
                                      ]),
                                      createTextVNode(" " + toDisplayString("  ") + " Feels like: " + toDisplayString("  ") + " "),
                                      createVNode("strong", null, [
                                        createTextVNode(toDisplayString(unref(getValue)("Feels Like", "")), 1),
                                        createVNode("sup", null, toDisplayString(unref(getUnit)("Feels Like")), 1)
                                      ])
                                    ])
                                  ])
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                        } else {
                          return [
                            createVNode(VCol, { class: "d-flex justify-center" }, {
                              default: withCtx(() => [
                                createVNode(VIcon, {
                                  icon: unref(getValue)("Weather Condition", "icon"),
                                  size: "128"
                                }, null, 8, ["icon"])
                              ]),
                              _: 1
                            }),
                            createVNode(VCol, { class: "d-flex justify-center" }, {
                              default: withCtx(() => [
                                createVNode("h1", null, toDisplayString(unref(getValue)("Weather Condition", "description")), 1)
                              ]),
                              _: 1
                            }),
                            createVNode(VCol, { class: "d-flex justify-center" }, {
                              default: withCtx(() => [
                                createVNode("h2", null, [
                                  createVNode("span", null, [
                                    createVNode("strong", null, [
                                      createTextVNode(toDisplayString(unref(getValue)("Temperature", "description")), 1),
                                      createVNode("sup", null, toDisplayString(unref(getUnit)("Temperature")), 1)
                                    ]),
                                    createTextVNode(" " + toDisplayString("  ") + " Feels like: " + toDisplayString("  ") + " "),
                                    createVNode("strong", null, [
                                      createTextVNode(toDisplayString(unref(getValue)("Feels Like", "")), 1),
                                      createVNode("sup", null, toDisplayString(unref(getUnit)("Feels Like")), 1)
                                    ])
                                  ])
                                ])
                              ]),
                              _: 1
                            })
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(VRow, {
                        "no-gutters": "",
                        class: "d-flex flex-column align-center"
                      }, {
                        default: withCtx(() => [
                          createVNode(VCol, { class: "d-flex justify-center" }, {
                            default: withCtx(() => [
                              createVNode(VIcon, {
                                icon: unref(getValue)("Weather Condition", "icon"),
                                size: "128"
                              }, null, 8, ["icon"])
                            ]),
                            _: 1
                          }),
                          createVNode(VCol, { class: "d-flex justify-center" }, {
                            default: withCtx(() => [
                              createVNode("h1", null, toDisplayString(unref(getValue)("Weather Condition", "description")), 1)
                            ]),
                            _: 1
                          }),
                          createVNode(VCol, { class: "d-flex justify-center" }, {
                            default: withCtx(() => [
                              createVNode("h2", null, [
                                createVNode("span", null, [
                                  createVNode("strong", null, [
                                    createTextVNode(toDisplayString(unref(getValue)("Temperature", "description")), 1),
                                    createVNode("sup", null, toDisplayString(unref(getUnit)("Temperature")), 1)
                                  ]),
                                  createTextVNode(" " + toDisplayString("  ") + " Feels like: " + toDisplayString("  ") + " "),
                                  createVNode("strong", null, [
                                    createTextVNode(toDisplayString(unref(getValue)("Feels Like", "")), 1),
                                    createVNode("sup", null, toDisplayString(unref(getUnit)("Feels Like")), 1)
                                  ])
                                ])
                              ])
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      })
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(VCardItem, null, {
                  prepend: withCtx(() => [
                    createVNode(VIcon, {
                      icon: unref(getValue)("Weather Condition", "icon")
                    }, null, 8, ["icon"])
                  ]),
                  default: withCtx(() => [
                    createVNode(VCardTitle, null, {
                      default: withCtx(() => [
                        createTextVNode(" Current Weather ")
                      ]),
                      _: 1
                    }),
                    createVNode(VCardSubtitle, null, {
                      default: withCtx(() => {
                        var _a, _b;
                        return [
                          createTextVNode(toDisplayString(unref(getCurrentLocaleDateString)((_b = (_a = unref(data)) == null ? void 0 : _a.current) == null ? void 0 : _b.time)), 1)
                        ];
                      }),
                      _: 1
                    })
                  ]),
                  _: 1
                }),
                createVNode(VCardText, { class: "" }, {
                  default: withCtx(() => [
                    createVNode(VRow, {
                      "no-gutters": "",
                      class: "d-flex flex-column align-center"
                    }, {
                      default: withCtx(() => [
                        createVNode(VCol, { class: "d-flex justify-center" }, {
                          default: withCtx(() => [
                            createVNode(VIcon, {
                              icon: unref(getValue)("Weather Condition", "icon"),
                              size: "128"
                            }, null, 8, ["icon"])
                          ]),
                          _: 1
                        }),
                        createVNode(VCol, { class: "d-flex justify-center" }, {
                          default: withCtx(() => [
                            createVNode("h1", null, toDisplayString(unref(getValue)("Weather Condition", "description")), 1)
                          ]),
                          _: 1
                        }),
                        createVNode(VCol, { class: "d-flex justify-center" }, {
                          default: withCtx(() => [
                            createVNode("h2", null, [
                              createVNode("span", null, [
                                createVNode("strong", null, [
                                  createTextVNode(toDisplayString(unref(getValue)("Temperature", "description")), 1),
                                  createVNode("sup", null, toDisplayString(unref(getUnit)("Temperature")), 1)
                                ]),
                                createTextVNode(" " + toDisplayString("  ") + " Feels like: " + toDisplayString("  ") + " "),
                                createVNode("strong", null, [
                                  createTextVNode(toDisplayString(unref(getValue)("Feels Like", "")), 1),
                                  createVNode("sup", null, toDisplayString(unref(getUnit)("Feels Like")), 1)
                                ])
                              ])
                            ])
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/forecast/w-widget.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const _sfc_main$4 = /* @__PURE__ */ defineComponent$1({
  __name: "w-ilvu",
  __ssrInlineRender: true,
  props: {
    name: {},
    icon: {},
    label: {},
    value: {},
    unit: {}
  },
  setup(__props) {
    var _a, _b, _c, _d;
    const props = __props;
    const icon = (_a = props.icon) != null ? _a : "icon";
    const label = (_b = props.label) != null ? _b : "label";
    const value = (_c = props.value) != null ? _c : "value";
    const unit = (_d = props.unit) != null ? _d : "Unit";
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mb-1" }, _attrs))}>`);
      _push(ssrRenderComponent(VCard, { variant: "tonal" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VCardItem, null, {
              prepend: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VIcon, { icon: unref(icon) }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(VIcon, { icon: unref(icon) }, null, 8, ["icon"])
                  ];
                }
              }),
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VCardTitle, null, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`${ssrInterpolate(unref(label))}: ${ssrInterpolate(unref(value))} ${ssrInterpolate(unref(unit))}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(unref(label)) + ": " + toDisplayString(unref(value)) + " " + toDisplayString(unref(unit)), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(VCardTitle, null, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(unref(label)) + ": " + toDisplayString(unref(value)) + " " + toDisplayString(unref(unit)), 1)
                      ]),
                      _: 1
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(VCardItem, null, {
                prepend: withCtx(() => [
                  createVNode(VIcon, { icon: unref(icon) }, null, 8, ["icon"])
                ]),
                default: withCtx(() => [
                  createVNode(VCardTitle, null, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(label)) + ": " + toDisplayString(unref(value)) + " " + toDisplayString(unref(unit)), 1)
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/forecast/w-ilvu.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const _sfc_main$3 = /* @__PURE__ */ defineComponent$1({
  __name: "w-detail",
  __ssrInlineRender: true,
  setup(__props) {
    const { getValue, getIcon, getUnit, data } = useForecast();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ForecastWIlvu = _sfc_main$4;
      if (unref(data)) {
        _push(`<div${ssrRenderAttrs(_attrs)}>`);
        _push(ssrRenderComponent(VCard, { variant: "text" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(VCardText, null, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(VRow, null, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(VCol, { cols: "6" }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(ssrRenderComponent(VRow, {
                                  "no-gutters": "",
                                  class: "d-flex flex-column"
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(ssrRenderComponent(VCol, null, {
                                        default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                          if (_push7) {
                                            _push7(ssrRenderComponent(_component_ForecastWIlvu, {
                                              label: "Cloud Cover",
                                              icon: unref(getIcon)("Cloud Cover"),
                                              value: unref(getValue)("Cloud Cover", ""),
                                              unit: unref(getUnit)("Cloud Cover")
                                            }, null, _parent7, _scopeId6));
                                          } else {
                                            return [
                                              createVNode(_component_ForecastWIlvu, {
                                                label: "Cloud Cover",
                                                icon: unref(getIcon)("Cloud Cover"),
                                                value: unref(getValue)("Cloud Cover", ""),
                                                unit: unref(getUnit)("Cloud Cover")
                                              }, null, 8, ["icon", "value", "unit"])
                                            ];
                                          }
                                        }),
                                        _: 1
                                      }, _parent6, _scopeId5));
                                      _push6(ssrRenderComponent(VCol, null, {
                                        default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                          if (_push7) {
                                            _push7(ssrRenderComponent(_component_ForecastWIlvu, {
                                              label: "Wind Speed",
                                              icon: unref(getIcon)("Wind Speed"),
                                              value: unref(getValue)("Wind Speed", ""),
                                              unit: unref(getUnit)("Wind Speed")
                                            }, null, _parent7, _scopeId6));
                                          } else {
                                            return [
                                              createVNode(_component_ForecastWIlvu, {
                                                label: "Wind Speed",
                                                icon: unref(getIcon)("Wind Speed"),
                                                value: unref(getValue)("Wind Speed", ""),
                                                unit: unref(getUnit)("Wind Speed")
                                              }, null, 8, ["icon", "value", "unit"])
                                            ];
                                          }
                                        }),
                                        _: 1
                                      }, _parent6, _scopeId5));
                                      _push6(ssrRenderComponent(VCol, null, {
                                        default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                          if (_push7) {
                                            _push7(ssrRenderComponent(_component_ForecastWIlvu, {
                                              label: "Surface Pressure",
                                              icon: unref(getIcon)("Surface Pressure"),
                                              value: unref(getValue)("Surface Pressure", ""),
                                              unit: unref(getUnit)("Surface Pressure")
                                            }, null, _parent7, _scopeId6));
                                          } else {
                                            return [
                                              createVNode(_component_ForecastWIlvu, {
                                                label: "Surface Pressure",
                                                icon: unref(getIcon)("Surface Pressure"),
                                                value: unref(getValue)("Surface Pressure", ""),
                                                unit: unref(getUnit)("Surface Pressure")
                                              }, null, 8, ["icon", "value", "unit"])
                                            ];
                                          }
                                        }),
                                        _: 1
                                      }, _parent6, _scopeId5));
                                      _push6(ssrRenderComponent(VCol, null, {
                                        default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                          if (_push7) {
                                            _push7(ssrRenderComponent(_component_ForecastWIlvu, {
                                              icon: unref(getIcon)("Wind Gusts"),
                                              value: unref(getValue)("Wind Gusts", ""),
                                              unit: unref(getUnit)("Wind Gusts"),
                                              label: "Wind Gusts"
                                            }, null, _parent7, _scopeId6));
                                          } else {
                                            return [
                                              createVNode(_component_ForecastWIlvu, {
                                                icon: unref(getIcon)("Wind Gusts"),
                                                value: unref(getValue)("Wind Gusts", ""),
                                                unit: unref(getUnit)("Wind Gusts"),
                                                label: "Wind Gusts"
                                              }, null, 8, ["icon", "value", "unit"])
                                            ];
                                          }
                                        }),
                                        _: 1
                                      }, _parent6, _scopeId5));
                                    } else {
                                      return [
                                        createVNode(VCol, null, {
                                          default: withCtx(() => [
                                            createVNode(_component_ForecastWIlvu, {
                                              label: "Cloud Cover",
                                              icon: unref(getIcon)("Cloud Cover"),
                                              value: unref(getValue)("Cloud Cover", ""),
                                              unit: unref(getUnit)("Cloud Cover")
                                            }, null, 8, ["icon", "value", "unit"])
                                          ]),
                                          _: 1
                                        }),
                                        createVNode(VCol, null, {
                                          default: withCtx(() => [
                                            createVNode(_component_ForecastWIlvu, {
                                              label: "Wind Speed",
                                              icon: unref(getIcon)("Wind Speed"),
                                              value: unref(getValue)("Wind Speed", ""),
                                              unit: unref(getUnit)("Wind Speed")
                                            }, null, 8, ["icon", "value", "unit"])
                                          ]),
                                          _: 1
                                        }),
                                        createVNode(VCol, null, {
                                          default: withCtx(() => [
                                            createVNode(_component_ForecastWIlvu, {
                                              label: "Surface Pressure",
                                              icon: unref(getIcon)("Surface Pressure"),
                                              value: unref(getValue)("Surface Pressure", ""),
                                              unit: unref(getUnit)("Surface Pressure")
                                            }, null, 8, ["icon", "value", "unit"])
                                          ]),
                                          _: 1
                                        }),
                                        createVNode(VCol, null, {
                                          default: withCtx(() => [
                                            createVNode(_component_ForecastWIlvu, {
                                              icon: unref(getIcon)("Wind Gusts"),
                                              value: unref(getValue)("Wind Gusts", ""),
                                              unit: unref(getUnit)("Wind Gusts"),
                                              label: "Wind Gusts"
                                            }, null, 8, ["icon", "value", "unit"])
                                          ]),
                                          _: 1
                                        })
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                              } else {
                                return [
                                  createVNode(VRow, {
                                    "no-gutters": "",
                                    class: "d-flex flex-column"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VCol, null, {
                                        default: withCtx(() => [
                                          createVNode(_component_ForecastWIlvu, {
                                            label: "Cloud Cover",
                                            icon: unref(getIcon)("Cloud Cover"),
                                            value: unref(getValue)("Cloud Cover", ""),
                                            unit: unref(getUnit)("Cloud Cover")
                                          }, null, 8, ["icon", "value", "unit"])
                                        ]),
                                        _: 1
                                      }),
                                      createVNode(VCol, null, {
                                        default: withCtx(() => [
                                          createVNode(_component_ForecastWIlvu, {
                                            label: "Wind Speed",
                                            icon: unref(getIcon)("Wind Speed"),
                                            value: unref(getValue)("Wind Speed", ""),
                                            unit: unref(getUnit)("Wind Speed")
                                          }, null, 8, ["icon", "value", "unit"])
                                        ]),
                                        _: 1
                                      }),
                                      createVNode(VCol, null, {
                                        default: withCtx(() => [
                                          createVNode(_component_ForecastWIlvu, {
                                            label: "Surface Pressure",
                                            icon: unref(getIcon)("Surface Pressure"),
                                            value: unref(getValue)("Surface Pressure", ""),
                                            unit: unref(getUnit)("Surface Pressure")
                                          }, null, 8, ["icon", "value", "unit"])
                                        ]),
                                        _: 1
                                      }),
                                      createVNode(VCol, null, {
                                        default: withCtx(() => [
                                          createVNode(_component_ForecastWIlvu, {
                                            icon: unref(getIcon)("Wind Gusts"),
                                            value: unref(getValue)("Wind Gusts", ""),
                                            unit: unref(getUnit)("Wind Gusts"),
                                            label: "Wind Gusts"
                                          }, null, 8, ["icon", "value", "unit"])
                                        ]),
                                        _: 1
                                      })
                                    ]),
                                    _: 1
                                  })
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(ssrRenderComponent(VCol, { cols: "6" }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(ssrRenderComponent(VRow, {
                                  "no-gutters": "",
                                  class: "d-flex flex-column"
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(ssrRenderComponent(VCol, null, {
                                        default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                          if (_push7) {
                                            _push7(ssrRenderComponent(_component_ForecastWIlvu, {
                                              label: "Precipitation",
                                              value: unref(getValue)("Precipitation", ""),
                                              icon: unref(getIcon)("Precipitation"),
                                              unit: unref(getUnit)("Precipitation")
                                            }, null, _parent7, _scopeId6));
                                          } else {
                                            return [
                                              createVNode(_component_ForecastWIlvu, {
                                                label: "Precipitation",
                                                value: unref(getValue)("Precipitation", ""),
                                                icon: unref(getIcon)("Precipitation"),
                                                unit: unref(getUnit)("Precipitation")
                                              }, null, 8, ["value", "icon", "unit"])
                                            ];
                                          }
                                        }),
                                        _: 1
                                      }, _parent6, _scopeId5));
                                      _push6(ssrRenderComponent(VCol, null, {
                                        default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                          if (_push7) {
                                            _push7(ssrRenderComponent(_component_ForecastWIlvu, {
                                              label: "Rain",
                                              value: unref(getValue)("Rain", ""),
                                              icon: unref(getIcon)("Rain"),
                                              unit: unref(getUnit)("Rain")
                                            }, null, _parent7, _scopeId6));
                                          } else {
                                            return [
                                              createVNode(_component_ForecastWIlvu, {
                                                label: "Rain",
                                                value: unref(getValue)("Rain", ""),
                                                icon: unref(getIcon)("Rain"),
                                                unit: unref(getUnit)("Rain")
                                              }, null, 8, ["value", "icon", "unit"])
                                            ];
                                          }
                                        }),
                                        _: 1
                                      }, _parent6, _scopeId5));
                                      _push6(ssrRenderComponent(VCol, null, {
                                        default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                          if (_push7) {
                                            _push7(ssrRenderComponent(_component_ForecastWIlvu, {
                                              label: "Showers",
                                              value: unref(getValue)("Showers", ""),
                                              icon: unref(getIcon)("Showers"),
                                              unit: unref(getUnit)("Showers")
                                            }, null, _parent7, _scopeId6));
                                          } else {
                                            return [
                                              createVNode(_component_ForecastWIlvu, {
                                                label: "Showers",
                                                value: unref(getValue)("Showers", ""),
                                                icon: unref(getIcon)("Showers"),
                                                unit: unref(getUnit)("Showers")
                                              }, null, 8, ["value", "icon", "unit"])
                                            ];
                                          }
                                        }),
                                        _: 1
                                      }, _parent6, _scopeId5));
                                      _push6(ssrRenderComponent(VCol, null, {
                                        default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                          if (_push7) {
                                            _push7(ssrRenderComponent(_component_ForecastWIlvu, {
                                              label: "Snowfall",
                                              value: unref(getValue)("Snowfall", ""),
                                              icon: unref(getIcon)("Snowfall"),
                                              unit: unref(getUnit)("Snowfall")
                                            }, null, _parent7, _scopeId6));
                                          } else {
                                            return [
                                              createVNode(_component_ForecastWIlvu, {
                                                label: "Snowfall",
                                                value: unref(getValue)("Snowfall", ""),
                                                icon: unref(getIcon)("Snowfall"),
                                                unit: unref(getUnit)("Snowfall")
                                              }, null, 8, ["value", "icon", "unit"])
                                            ];
                                          }
                                        }),
                                        _: 1
                                      }, _parent6, _scopeId5));
                                    } else {
                                      return [
                                        createVNode(VCol, null, {
                                          default: withCtx(() => [
                                            createVNode(_component_ForecastWIlvu, {
                                              label: "Precipitation",
                                              value: unref(getValue)("Precipitation", ""),
                                              icon: unref(getIcon)("Precipitation"),
                                              unit: unref(getUnit)("Precipitation")
                                            }, null, 8, ["value", "icon", "unit"])
                                          ]),
                                          _: 1
                                        }),
                                        createVNode(VCol, null, {
                                          default: withCtx(() => [
                                            createVNode(_component_ForecastWIlvu, {
                                              label: "Rain",
                                              value: unref(getValue)("Rain", ""),
                                              icon: unref(getIcon)("Rain"),
                                              unit: unref(getUnit)("Rain")
                                            }, null, 8, ["value", "icon", "unit"])
                                          ]),
                                          _: 1
                                        }),
                                        createVNode(VCol, null, {
                                          default: withCtx(() => [
                                            createVNode(_component_ForecastWIlvu, {
                                              label: "Showers",
                                              value: unref(getValue)("Showers", ""),
                                              icon: unref(getIcon)("Showers"),
                                              unit: unref(getUnit)("Showers")
                                            }, null, 8, ["value", "icon", "unit"])
                                          ]),
                                          _: 1
                                        }),
                                        createVNode(VCol, null, {
                                          default: withCtx(() => [
                                            createVNode(_component_ForecastWIlvu, {
                                              label: "Snowfall",
                                              value: unref(getValue)("Snowfall", ""),
                                              icon: unref(getIcon)("Snowfall"),
                                              unit: unref(getUnit)("Snowfall")
                                            }, null, 8, ["value", "icon", "unit"])
                                          ]),
                                          _: 1
                                        })
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                              } else {
                                return [
                                  createVNode(VRow, {
                                    "no-gutters": "",
                                    class: "d-flex flex-column"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VCol, null, {
                                        default: withCtx(() => [
                                          createVNode(_component_ForecastWIlvu, {
                                            label: "Precipitation",
                                            value: unref(getValue)("Precipitation", ""),
                                            icon: unref(getIcon)("Precipitation"),
                                            unit: unref(getUnit)("Precipitation")
                                          }, null, 8, ["value", "icon", "unit"])
                                        ]),
                                        _: 1
                                      }),
                                      createVNode(VCol, null, {
                                        default: withCtx(() => [
                                          createVNode(_component_ForecastWIlvu, {
                                            label: "Rain",
                                            value: unref(getValue)("Rain", ""),
                                            icon: unref(getIcon)("Rain"),
                                            unit: unref(getUnit)("Rain")
                                          }, null, 8, ["value", "icon", "unit"])
                                        ]),
                                        _: 1
                                      }),
                                      createVNode(VCol, null, {
                                        default: withCtx(() => [
                                          createVNode(_component_ForecastWIlvu, {
                                            label: "Showers",
                                            value: unref(getValue)("Showers", ""),
                                            icon: unref(getIcon)("Showers"),
                                            unit: unref(getUnit)("Showers")
                                          }, null, 8, ["value", "icon", "unit"])
                                        ]),
                                        _: 1
                                      }),
                                      createVNode(VCol, null, {
                                        default: withCtx(() => [
                                          createVNode(_component_ForecastWIlvu, {
                                            label: "Snowfall",
                                            value: unref(getValue)("Snowfall", ""),
                                            icon: unref(getIcon)("Snowfall"),
                                            unit: unref(getUnit)("Snowfall")
                                          }, null, 8, ["value", "icon", "unit"])
                                        ]),
                                        _: 1
                                      })
                                    ]),
                                    _: 1
                                  })
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                        } else {
                          return [
                            createVNode(VCol, { cols: "6" }, {
                              default: withCtx(() => [
                                createVNode(VRow, {
                                  "no-gutters": "",
                                  class: "d-flex flex-column"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VCol, null, {
                                      default: withCtx(() => [
                                        createVNode(_component_ForecastWIlvu, {
                                          label: "Cloud Cover",
                                          icon: unref(getIcon)("Cloud Cover"),
                                          value: unref(getValue)("Cloud Cover", ""),
                                          unit: unref(getUnit)("Cloud Cover")
                                        }, null, 8, ["icon", "value", "unit"])
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(VCol, null, {
                                      default: withCtx(() => [
                                        createVNode(_component_ForecastWIlvu, {
                                          label: "Wind Speed",
                                          icon: unref(getIcon)("Wind Speed"),
                                          value: unref(getValue)("Wind Speed", ""),
                                          unit: unref(getUnit)("Wind Speed")
                                        }, null, 8, ["icon", "value", "unit"])
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(VCol, null, {
                                      default: withCtx(() => [
                                        createVNode(_component_ForecastWIlvu, {
                                          label: "Surface Pressure",
                                          icon: unref(getIcon)("Surface Pressure"),
                                          value: unref(getValue)("Surface Pressure", ""),
                                          unit: unref(getUnit)("Surface Pressure")
                                        }, null, 8, ["icon", "value", "unit"])
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(VCol, null, {
                                      default: withCtx(() => [
                                        createVNode(_component_ForecastWIlvu, {
                                          icon: unref(getIcon)("Wind Gusts"),
                                          value: unref(getValue)("Wind Gusts", ""),
                                          unit: unref(getUnit)("Wind Gusts"),
                                          label: "Wind Gusts"
                                        }, null, 8, ["icon", "value", "unit"])
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                })
                              ]),
                              _: 1
                            }),
                            createVNode(VCol, { cols: "6" }, {
                              default: withCtx(() => [
                                createVNode(VRow, {
                                  "no-gutters": "",
                                  class: "d-flex flex-column"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VCol, null, {
                                      default: withCtx(() => [
                                        createVNode(_component_ForecastWIlvu, {
                                          label: "Precipitation",
                                          value: unref(getValue)("Precipitation", ""),
                                          icon: unref(getIcon)("Precipitation"),
                                          unit: unref(getUnit)("Precipitation")
                                        }, null, 8, ["value", "icon", "unit"])
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(VCol, null, {
                                      default: withCtx(() => [
                                        createVNode(_component_ForecastWIlvu, {
                                          label: "Rain",
                                          value: unref(getValue)("Rain", ""),
                                          icon: unref(getIcon)("Rain"),
                                          unit: unref(getUnit)("Rain")
                                        }, null, 8, ["value", "icon", "unit"])
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(VCol, null, {
                                      default: withCtx(() => [
                                        createVNode(_component_ForecastWIlvu, {
                                          label: "Showers",
                                          value: unref(getValue)("Showers", ""),
                                          icon: unref(getIcon)("Showers"),
                                          unit: unref(getUnit)("Showers")
                                        }, null, 8, ["value", "icon", "unit"])
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(VCol, null, {
                                      default: withCtx(() => [
                                        createVNode(_component_ForecastWIlvu, {
                                          label: "Snowfall",
                                          value: unref(getValue)("Snowfall", ""),
                                          icon: unref(getIcon)("Snowfall"),
                                          unit: unref(getUnit)("Snowfall")
                                        }, null, 8, ["value", "icon", "unit"])
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                })
                              ]),
                              _: 1
                            })
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(VRow, null, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(VCol, { cols: "6" }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(ssrRenderComponent(VRow, {
                                  "no-gutters": "",
                                  class: "d-flex flex-column"
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(ssrRenderComponent(VCol, null, {
                                        default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                          if (_push7) {
                                            _push7(ssrRenderComponent(_component_ForecastWIlvu, {
                                              icon: unref(getIcon)("Relative Humidity"),
                                              label: "Humidity",
                                              value: unref(getValue)("Relative Humidity", ""),
                                              unit: unref(getUnit)("Relative Humidity")
                                            }, null, _parent7, _scopeId6));
                                          } else {
                                            return [
                                              createVNode(_component_ForecastWIlvu, {
                                                icon: unref(getIcon)("Relative Humidity"),
                                                label: "Humidity",
                                                value: unref(getValue)("Relative Humidity", ""),
                                                unit: unref(getUnit)("Relative Humidity")
                                              }, null, 8, ["icon", "value", "unit"])
                                            ];
                                          }
                                        }),
                                        _: 1
                                      }, _parent6, _scopeId5));
                                    } else {
                                      return [
                                        createVNode(VCol, null, {
                                          default: withCtx(() => [
                                            createVNode(_component_ForecastWIlvu, {
                                              icon: unref(getIcon)("Relative Humidity"),
                                              label: "Humidity",
                                              value: unref(getValue)("Relative Humidity", ""),
                                              unit: unref(getUnit)("Relative Humidity")
                                            }, null, 8, ["icon", "value", "unit"])
                                          ]),
                                          _: 1
                                        })
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                              } else {
                                return [
                                  createVNode(VRow, {
                                    "no-gutters": "",
                                    class: "d-flex flex-column"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VCol, null, {
                                        default: withCtx(() => [
                                          createVNode(_component_ForecastWIlvu, {
                                            icon: unref(getIcon)("Relative Humidity"),
                                            label: "Humidity",
                                            value: unref(getValue)("Relative Humidity", ""),
                                            unit: unref(getUnit)("Relative Humidity")
                                          }, null, 8, ["icon", "value", "unit"])
                                        ]),
                                        _: 1
                                      })
                                    ]),
                                    _: 1
                                  })
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(ssrRenderComponent(VCol, { cols: "6" }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(ssrRenderComponent(VRow, {
                                  "no-gutters": "",
                                  class: "d-flex flex-column"
                                }, null, _parent5, _scopeId4));
                              } else {
                                return [
                                  createVNode(VRow, {
                                    "no-gutters": "",
                                    class: "d-flex flex-column"
                                  })
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                        } else {
                          return [
                            createVNode(VCol, { cols: "6" }, {
                              default: withCtx(() => [
                                createVNode(VRow, {
                                  "no-gutters": "",
                                  class: "d-flex flex-column"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VCol, null, {
                                      default: withCtx(() => [
                                        createVNode(_component_ForecastWIlvu, {
                                          icon: unref(getIcon)("Relative Humidity"),
                                          label: "Humidity",
                                          value: unref(getValue)("Relative Humidity", ""),
                                          unit: unref(getUnit)("Relative Humidity")
                                        }, null, 8, ["icon", "value", "unit"])
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                })
                              ]),
                              _: 1
                            }),
                            createVNode(VCol, { cols: "6" }, {
                              default: withCtx(() => [
                                createVNode(VRow, {
                                  "no-gutters": "",
                                  class: "d-flex flex-column"
                                })
                              ]),
                              _: 1
                            })
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(VRow, null, {
                        default: withCtx(() => [
                          createVNode(VCol, { cols: "6" }, {
                            default: withCtx(() => [
                              createVNode(VRow, {
                                "no-gutters": "",
                                class: "d-flex flex-column"
                              }, {
                                default: withCtx(() => [
                                  createVNode(VCol, null, {
                                    default: withCtx(() => [
                                      createVNode(_component_ForecastWIlvu, {
                                        label: "Cloud Cover",
                                        icon: unref(getIcon)("Cloud Cover"),
                                        value: unref(getValue)("Cloud Cover", ""),
                                        unit: unref(getUnit)("Cloud Cover")
                                      }, null, 8, ["icon", "value", "unit"])
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(VCol, null, {
                                    default: withCtx(() => [
                                      createVNode(_component_ForecastWIlvu, {
                                        label: "Wind Speed",
                                        icon: unref(getIcon)("Wind Speed"),
                                        value: unref(getValue)("Wind Speed", ""),
                                        unit: unref(getUnit)("Wind Speed")
                                      }, null, 8, ["icon", "value", "unit"])
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(VCol, null, {
                                    default: withCtx(() => [
                                      createVNode(_component_ForecastWIlvu, {
                                        label: "Surface Pressure",
                                        icon: unref(getIcon)("Surface Pressure"),
                                        value: unref(getValue)("Surface Pressure", ""),
                                        unit: unref(getUnit)("Surface Pressure")
                                      }, null, 8, ["icon", "value", "unit"])
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(VCol, null, {
                                    default: withCtx(() => [
                                      createVNode(_component_ForecastWIlvu, {
                                        icon: unref(getIcon)("Wind Gusts"),
                                        value: unref(getValue)("Wind Gusts", ""),
                                        unit: unref(getUnit)("Wind Gusts"),
                                        label: "Wind Gusts"
                                      }, null, 8, ["icon", "value", "unit"])
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          }),
                          createVNode(VCol, { cols: "6" }, {
                            default: withCtx(() => [
                              createVNode(VRow, {
                                "no-gutters": "",
                                class: "d-flex flex-column"
                              }, {
                                default: withCtx(() => [
                                  createVNode(VCol, null, {
                                    default: withCtx(() => [
                                      createVNode(_component_ForecastWIlvu, {
                                        label: "Precipitation",
                                        value: unref(getValue)("Precipitation", ""),
                                        icon: unref(getIcon)("Precipitation"),
                                        unit: unref(getUnit)("Precipitation")
                                      }, null, 8, ["value", "icon", "unit"])
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(VCol, null, {
                                    default: withCtx(() => [
                                      createVNode(_component_ForecastWIlvu, {
                                        label: "Rain",
                                        value: unref(getValue)("Rain", ""),
                                        icon: unref(getIcon)("Rain"),
                                        unit: unref(getUnit)("Rain")
                                      }, null, 8, ["value", "icon", "unit"])
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(VCol, null, {
                                    default: withCtx(() => [
                                      createVNode(_component_ForecastWIlvu, {
                                        label: "Showers",
                                        value: unref(getValue)("Showers", ""),
                                        icon: unref(getIcon)("Showers"),
                                        unit: unref(getUnit)("Showers")
                                      }, null, 8, ["value", "icon", "unit"])
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(VCol, null, {
                                    default: withCtx(() => [
                                      createVNode(_component_ForecastWIlvu, {
                                        label: "Snowfall",
                                        value: unref(getValue)("Snowfall", ""),
                                        icon: unref(getIcon)("Snowfall"),
                                        unit: unref(getUnit)("Snowfall")
                                      }, null, 8, ["value", "icon", "unit"])
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }),
                      createVNode(VRow, null, {
                        default: withCtx(() => [
                          createVNode(VCol, { cols: "6" }, {
                            default: withCtx(() => [
                              createVNode(VRow, {
                                "no-gutters": "",
                                class: "d-flex flex-column"
                              }, {
                                default: withCtx(() => [
                                  createVNode(VCol, null, {
                                    default: withCtx(() => [
                                      createVNode(_component_ForecastWIlvu, {
                                        icon: unref(getIcon)("Relative Humidity"),
                                        label: "Humidity",
                                        value: unref(getValue)("Relative Humidity", ""),
                                        unit: unref(getUnit)("Relative Humidity")
                                      }, null, 8, ["icon", "value", "unit"])
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          }),
                          createVNode(VCol, { cols: "6" }, {
                            default: withCtx(() => [
                              createVNode(VRow, {
                                "no-gutters": "",
                                class: "d-flex flex-column"
                              })
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      })
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(VCardText, null, {
                  default: withCtx(() => [
                    createVNode(VRow, null, {
                      default: withCtx(() => [
                        createVNode(VCol, { cols: "6" }, {
                          default: withCtx(() => [
                            createVNode(VRow, {
                              "no-gutters": "",
                              class: "d-flex flex-column"
                            }, {
                              default: withCtx(() => [
                                createVNode(VCol, null, {
                                  default: withCtx(() => [
                                    createVNode(_component_ForecastWIlvu, {
                                      label: "Cloud Cover",
                                      icon: unref(getIcon)("Cloud Cover"),
                                      value: unref(getValue)("Cloud Cover", ""),
                                      unit: unref(getUnit)("Cloud Cover")
                                    }, null, 8, ["icon", "value", "unit"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(VCol, null, {
                                  default: withCtx(() => [
                                    createVNode(_component_ForecastWIlvu, {
                                      label: "Wind Speed",
                                      icon: unref(getIcon)("Wind Speed"),
                                      value: unref(getValue)("Wind Speed", ""),
                                      unit: unref(getUnit)("Wind Speed")
                                    }, null, 8, ["icon", "value", "unit"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(VCol, null, {
                                  default: withCtx(() => [
                                    createVNode(_component_ForecastWIlvu, {
                                      label: "Surface Pressure",
                                      icon: unref(getIcon)("Surface Pressure"),
                                      value: unref(getValue)("Surface Pressure", ""),
                                      unit: unref(getUnit)("Surface Pressure")
                                    }, null, 8, ["icon", "value", "unit"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(VCol, null, {
                                  default: withCtx(() => [
                                    createVNode(_component_ForecastWIlvu, {
                                      icon: unref(getIcon)("Wind Gusts"),
                                      value: unref(getValue)("Wind Gusts", ""),
                                      unit: unref(getUnit)("Wind Gusts"),
                                      label: "Wind Gusts"
                                    }, null, 8, ["icon", "value", "unit"])
                                  ]),
                                  _: 1
                                })
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        }),
                        createVNode(VCol, { cols: "6" }, {
                          default: withCtx(() => [
                            createVNode(VRow, {
                              "no-gutters": "",
                              class: "d-flex flex-column"
                            }, {
                              default: withCtx(() => [
                                createVNode(VCol, null, {
                                  default: withCtx(() => [
                                    createVNode(_component_ForecastWIlvu, {
                                      label: "Precipitation",
                                      value: unref(getValue)("Precipitation", ""),
                                      icon: unref(getIcon)("Precipitation"),
                                      unit: unref(getUnit)("Precipitation")
                                    }, null, 8, ["value", "icon", "unit"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(VCol, null, {
                                  default: withCtx(() => [
                                    createVNode(_component_ForecastWIlvu, {
                                      label: "Rain",
                                      value: unref(getValue)("Rain", ""),
                                      icon: unref(getIcon)("Rain"),
                                      unit: unref(getUnit)("Rain")
                                    }, null, 8, ["value", "icon", "unit"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(VCol, null, {
                                  default: withCtx(() => [
                                    createVNode(_component_ForecastWIlvu, {
                                      label: "Showers",
                                      value: unref(getValue)("Showers", ""),
                                      icon: unref(getIcon)("Showers"),
                                      unit: unref(getUnit)("Showers")
                                    }, null, 8, ["value", "icon", "unit"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(VCol, null, {
                                  default: withCtx(() => [
                                    createVNode(_component_ForecastWIlvu, {
                                      label: "Snowfall",
                                      value: unref(getValue)("Snowfall", ""),
                                      icon: unref(getIcon)("Snowfall"),
                                      unit: unref(getUnit)("Snowfall")
                                    }, null, 8, ["value", "icon", "unit"])
                                  ]),
                                  _: 1
                                })
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }),
                    createVNode(VRow, null, {
                      default: withCtx(() => [
                        createVNode(VCol, { cols: "6" }, {
                          default: withCtx(() => [
                            createVNode(VRow, {
                              "no-gutters": "",
                              class: "d-flex flex-column"
                            }, {
                              default: withCtx(() => [
                                createVNode(VCol, null, {
                                  default: withCtx(() => [
                                    createVNode(_component_ForecastWIlvu, {
                                      icon: unref(getIcon)("Relative Humidity"),
                                      label: "Humidity",
                                      value: unref(getValue)("Relative Humidity", ""),
                                      unit: unref(getUnit)("Relative Humidity")
                                    }, null, 8, ["icon", "value", "unit"])
                                  ]),
                                  _: 1
                                })
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        }),
                        createVNode(VCol, { cols: "6" }, {
                          default: withCtx(() => [
                            createVNode(VRow, {
                              "no-gutters": "",
                              class: "d-flex flex-column"
                            })
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/forecast/w-detail.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const _sfc_main$2 = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_ForecastWWidget = _sfc_main$5;
  const _component_ForecastWDetail = _sfc_main$3;
  _push(`<div${ssrRenderAttrs(_attrs)}>`);
  _push(ssrRenderComponent(VRow, { "no-gutters": "" }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(VCol, {
          sm: "6",
          cols: "12"
        }, {
          default: withCtx((_2, _push3, _parent3, _scopeId2) => {
            if (_push3) {
              _push3(ssrRenderComponent(_component_ForecastWWidget, null, null, _parent3, _scopeId2));
            } else {
              return [
                createVNode(_component_ForecastWWidget)
              ];
            }
          }),
          _: 1
        }, _parent2, _scopeId));
        _push2(ssrRenderComponent(VCol, {
          sm: "6",
          cols: "12"
        }, {
          default: withCtx((_2, _push3, _parent3, _scopeId2) => {
            if (_push3) {
              _push3(ssrRenderComponent(_component_ForecastWDetail, null, null, _parent3, _scopeId2));
            } else {
              return [
                createVNode(_component_ForecastWDetail)
              ];
            }
          }),
          _: 1
        }, _parent2, _scopeId));
      } else {
        return [
          createVNode(VCol, {
            sm: "6",
            cols: "12"
          }, {
            default: withCtx(() => [
              createVNode(_component_ForecastWWidget)
            ]),
            _: 1
          }),
          createVNode(VCol, {
            sm: "6",
            cols: "12"
          }, {
            default: withCtx(() => [
              createVNode(_component_ForecastWDetail)
            ]),
            _: 1
          })
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/forecast/w-forecast.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["ssrRender", _sfc_ssrRender]]);
const _sfc_main$1 = /* @__PURE__ */ defineComponent$1({
  __name: "w-setting",
  __ssrInlineRender: true,
  setup(__props) {
    const { themeSetting, temperature_unit, toggleTheme, toggeleUnit } = useSetting();
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "d-flex flex-column align-center" }, _attrs))}>`);
      _push(ssrRenderComponent(VCard, {
        class: "d-flex flex-column align-center",
        variant: "text"
      }, {
        prepend: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VIcon, { icon: "mdi-cloud" }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(VIcon, { icon: "mdi-cloud" })
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VCardTitle, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` Weather App `);
                } else {
                  return [
                    createTextVNode(" Weather App ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(VCardSubtitle, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` copyright@uddhav.com `);
                } else {
                  return [
                    createTextVNode(" copyright@uddhav.com ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(VCardTitle, null, {
                default: withCtx(() => [
                  createTextVNode(" Weather App ")
                ]),
                _: 1
              }),
              createVNode(VCardSubtitle, null, {
                default: withCtx(() => [
                  createTextVNode(" copyright@uddhav.com ")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(VCard, {
        class: "d-flex flex-column align-center",
        variant: "text"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VCardTitle, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` App Version `);
                } else {
                  return [
                    createTextVNode(" App Version ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(VCardSubtitle, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` 1.0.0 `);
                } else {
                  return [
                    createTextVNode(" 1.0.0 ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(VCardTitle, null, {
                default: withCtx(() => [
                  createTextVNode(" App Version ")
                ]),
                _: 1
              }),
              createVNode(VCardSubtitle, null, {
                default: withCtx(() => [
                  createTextVNode(" 1.0.0 ")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(VCard, {
        class: "d-flex flex-column align-center",
        variant: "text"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VCardTitle, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` Unit setting `);
                } else {
                  return [
                    createTextVNode(" Unit setting ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(VCardSubtitle, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VBtnToggle, {
                    modelValue: unref(temperature_unit),
                    "onUpdate:modelValue": ($event) => isRef(temperature_unit) ? temperature_unit.value = $event : null,
                    onClick: unref(toggeleUnit)
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VBtn, { value: "celsius" }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(` Celsius `);
                            } else {
                              return [
                                createTextVNode(" Celsius ")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VBtn, { value: "fahrenheit" }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(` Fahrenheit `);
                            } else {
                              return [
                                createTextVNode(" Fahrenheit ")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VBtn, { value: "celsius" }, {
                            default: withCtx(() => [
                              createTextVNode(" Celsius ")
                            ]),
                            _: 1
                          }),
                          createVNode(VBtn, { value: "fahrenheit" }, {
                            default: withCtx(() => [
                              createTextVNode(" Fahrenheit ")
                            ]),
                            _: 1
                          })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(VBtnToggle, {
                      modelValue: unref(temperature_unit),
                      "onUpdate:modelValue": ($event) => isRef(temperature_unit) ? temperature_unit.value = $event : null,
                      onClick: unref(toggeleUnit)
                    }, {
                      default: withCtx(() => [
                        createVNode(VBtn, { value: "celsius" }, {
                          default: withCtx(() => [
                            createTextVNode(" Celsius ")
                          ]),
                          _: 1
                        }),
                        createVNode(VBtn, { value: "fahrenheit" }, {
                          default: withCtx(() => [
                            createTextVNode(" Fahrenheit ")
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }, 8, ["modelValue", "onUpdate:modelValue", "onClick"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(VCardTitle, null, {
                default: withCtx(() => [
                  createTextVNode(" Unit setting ")
                ]),
                _: 1
              }),
              createVNode(VCardSubtitle, null, {
                default: withCtx(() => [
                  createVNode(VBtnToggle, {
                    modelValue: unref(temperature_unit),
                    "onUpdate:modelValue": ($event) => isRef(temperature_unit) ? temperature_unit.value = $event : null,
                    onClick: unref(toggeleUnit)
                  }, {
                    default: withCtx(() => [
                      createVNode(VBtn, { value: "celsius" }, {
                        default: withCtx(() => [
                          createTextVNode(" Celsius ")
                        ]),
                        _: 1
                      }),
                      createVNode(VBtn, { value: "fahrenheit" }, {
                        default: withCtx(() => [
                          createTextVNode(" Fahrenheit ")
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  }, 8, ["modelValue", "onUpdate:modelValue", "onClick"])
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(VCard, {
        class: "d-flex flex-column align-center",
        variant: "text"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VCardTitle, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` Theme setting `);
                } else {
                  return [
                    createTextVNode(" Theme setting ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(VCardSubtitle, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VBtnToggle, {
                    modelValue: unref(themeSetting),
                    "onUpdate:modelValue": ($event) => isRef(themeSetting) ? themeSetting.value = $event : null,
                    onClick: unref(toggleTheme)
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VBtn, { value: "dark" }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(` Dark `);
                            } else {
                              return [
                                createTextVNode(" Dark ")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VBtn, { value: "light" }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(` Light `);
                            } else {
                              return [
                                createTextVNode(" Light ")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VBtn, { value: "dark" }, {
                            default: withCtx(() => [
                              createTextVNode(" Dark ")
                            ]),
                            _: 1
                          }),
                          createVNode(VBtn, { value: "light" }, {
                            default: withCtx(() => [
                              createTextVNode(" Light ")
                            ]),
                            _: 1
                          })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(VBtnToggle, {
                      modelValue: unref(themeSetting),
                      "onUpdate:modelValue": ($event) => isRef(themeSetting) ? themeSetting.value = $event : null,
                      onClick: unref(toggleTheme)
                    }, {
                      default: withCtx(() => [
                        createVNode(VBtn, { value: "dark" }, {
                          default: withCtx(() => [
                            createTextVNode(" Dark ")
                          ]),
                          _: 1
                        }),
                        createVNode(VBtn, { value: "light" }, {
                          default: withCtx(() => [
                            createTextVNode(" Light ")
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }, 8, ["modelValue", "onUpdate:modelValue", "onClick"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(VCardTitle, null, {
                default: withCtx(() => [
                  createTextVNode(" Theme setting ")
                ]),
                _: 1
              }),
              createVNode(VCardSubtitle, null, {
                default: withCtx(() => [
                  createVNode(VBtnToggle, {
                    modelValue: unref(themeSetting),
                    "onUpdate:modelValue": ($event) => isRef(themeSetting) ? themeSetting.value = $event : null,
                    onClick: unref(toggleTheme)
                  }, {
                    default: withCtx(() => [
                      createVNode(VBtn, { value: "dark" }, {
                        default: withCtx(() => [
                          createTextVNode(" Dark ")
                        ]),
                        _: 1
                      }),
                      createVNode(VBtn, { value: "light" }, {
                        default: withCtx(() => [
                          createTextVNode(" Light ")
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  }, 8, ["modelValue", "onUpdate:modelValue", "onClick"])
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/setting/w-setting.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent$1({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    useForecast();
    const { tabs } = useSetting();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LocationWLocation = _sfc_main$6;
      const _component_ForecastWForecast = __nuxt_component_1;
      const _component_SettingWSetting = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(VContainer, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VTabsWindow, {
              modelValue: unref(tabs),
              "onUpdate:modelValue": ($event) => isRef(tabs) ? tabs.value = $event : null
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VTabsWindowItem, { value: "location" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_LocationWLocation, null, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_LocationWLocation)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VTabsWindowItem, { value: "forecast" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_ForecastWForecast, null, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_ForecastWForecast)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VTabsWindowItem, { value: "settings" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_SettingWSetting, null, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_SettingWSetting)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(VTabsWindowItem, { value: "location" }, {
                      default: withCtx(() => [
                        createVNode(_component_LocationWLocation)
                      ]),
                      _: 1
                    }),
                    createVNode(VTabsWindowItem, { value: "forecast" }, {
                      default: withCtx(() => [
                        createVNode(_component_ForecastWForecast)
                      ]),
                      _: 1
                    }),
                    createVNode(VTabsWindowItem, { value: "settings" }, {
                      default: withCtx(() => [
                        createVNode(_component_SettingWSetting)
                      ]),
                      _: 1
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(VTabsWindow, {
                modelValue: unref(tabs),
                "onUpdate:modelValue": ($event) => isRef(tabs) ? tabs.value = $event : null
              }, {
                default: withCtx(() => [
                  createVNode(VTabsWindowItem, { value: "location" }, {
                    default: withCtx(() => [
                      createVNode(_component_LocationWLocation)
                    ]),
                    _: 1
                  }),
                  createVNode(VTabsWindowItem, { value: "forecast" }, {
                    default: withCtx(() => [
                      createVNode(_component_ForecastWForecast)
                    ]),
                    _: 1
                  }),
                  createVNode(VTabsWindowItem, { value: "settings" }, {
                    default: withCtx(() => [
                      createVNode(_component_SettingWSetting)
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }, 8, ["modelValue", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-Dw1JYn_U.mjs.map
