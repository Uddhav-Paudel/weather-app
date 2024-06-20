import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import http, { Server as Server$1 } from 'node:http';
import https, { Server } from 'node:https';
import { promises, existsSync } from 'fs';
import { dirname as dirname$1, resolve as resolve$1, join } from 'path';
import { promises as promises$1 } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ipxFSStorage, ipxHttpStorage, createIPX, createIPXH3Handler } from 'ipx';

const suspectProtoRx = /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/;
const suspectConstructorRx = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;
const JsonSigRx = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;
function jsonParseTransform(key, value) {
  if (key === "__proto__" || key === "constructor" && value && typeof value === "object" && "prototype" in value) {
    warnKeyDropped(key);
    return;
  }
  return value;
}
function warnKeyDropped(key) {
  console.warn(`[destr] Dropping "${key}" key to prevent prototype pollution.`);
}
function destr(value, options = {}) {
  if (typeof value !== "string") {
    return value;
  }
  const _value = value.trim();
  if (
    // eslint-disable-next-line unicorn/prefer-at
    value[0] === '"' && value.endsWith('"') && !value.includes("\\")
  ) {
    return _value.slice(1, -1);
  }
  if (_value.length <= 9) {
    const _lval = _value.toLowerCase();
    if (_lval === "true") {
      return true;
    }
    if (_lval === "false") {
      return false;
    }
    if (_lval === "undefined") {
      return void 0;
    }
    if (_lval === "null") {
      return null;
    }
    if (_lval === "nan") {
      return Number.NaN;
    }
    if (_lval === "infinity") {
      return Number.POSITIVE_INFINITY;
    }
    if (_lval === "-infinity") {
      return Number.NEGATIVE_INFINITY;
    }
  }
  if (!JsonSigRx.test(value)) {
    if (options.strict) {
      throw new SyntaxError("[destr] Invalid JSON");
    }
    return value;
  }
  try {
    if (suspectProtoRx.test(value) || suspectConstructorRx.test(value)) {
      if (options.strict) {
        throw new Error("[destr] Possible prototype pollution");
      }
      return JSON.parse(value, jsonParseTransform);
    }
    return JSON.parse(value);
  } catch (error) {
    if (options.strict) {
      throw error;
    }
    return value;
  }
}

const HASH_RE = /#/g;
const AMPERSAND_RE = /&/g;
const SLASH_RE = /\//g;
const EQUAL_RE = /=/g;
const PLUS_RE = /\+/g;
const ENC_CARET_RE = /%5e/gi;
const ENC_BACKTICK_RE = /%60/gi;
const ENC_PIPE_RE = /%7c/gi;
const ENC_SPACE_RE = /%20/gi;
const ENC_SLASH_RE = /%2f/gi;
function encode(text) {
  return encodeURI("" + text).replace(ENC_PIPE_RE, "|");
}
function encodeQueryValue(input) {
  return encode(typeof input === "string" ? input : JSON.stringify(input)).replace(PLUS_RE, "%2B").replace(ENC_SPACE_RE, "+").replace(HASH_RE, "%23").replace(AMPERSAND_RE, "%26").replace(ENC_BACKTICK_RE, "`").replace(ENC_CARET_RE, "^").replace(SLASH_RE, "%2F");
}
function encodeQueryKey(text) {
  return encodeQueryValue(text).replace(EQUAL_RE, "%3D");
}
function decode(text = "") {
  try {
    return decodeURIComponent("" + text);
  } catch {
    return "" + text;
  }
}
function decodePath(text) {
  return decode(text.replace(ENC_SLASH_RE, "%252F"));
}
function decodeQueryKey(text) {
  return decode(text.replace(PLUS_RE, " "));
}
function decodeQueryValue(text) {
  return decode(text.replace(PLUS_RE, " "));
}

function parseQuery(parametersString = "") {
  const object = {};
  if (parametersString[0] === "?") {
    parametersString = parametersString.slice(1);
  }
  for (const parameter of parametersString.split("&")) {
    const s = parameter.match(/([^=]+)=?(.*)/) || [];
    if (s.length < 2) {
      continue;
    }
    const key = decodeQueryKey(s[1]);
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = decodeQueryValue(s[2] || "");
    if (object[key] === void 0) {
      object[key] = value;
    } else if (Array.isArray(object[key])) {
      object[key].push(value);
    } else {
      object[key] = [object[key], value];
    }
  }
  return object;
}
function encodeQueryItem(key, value) {
  if (typeof value === "number" || typeof value === "boolean") {
    value = String(value);
  }
  if (!value) {
    return encodeQueryKey(key);
  }
  if (Array.isArray(value)) {
    return value.map((_value) => `${encodeQueryKey(key)}=${encodeQueryValue(_value)}`).join("&");
  }
  return `${encodeQueryKey(key)}=${encodeQueryValue(value)}`;
}
function stringifyQuery(query) {
  return Object.keys(query).filter((k) => query[k] !== void 0).map((k) => encodeQueryItem(k, query[k])).filter(Boolean).join("&");
}

const PROTOCOL_STRICT_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{1,2})/;
const PROTOCOL_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{2})?/;
const PROTOCOL_RELATIVE_REGEX = /^([/\\]\s*){2,}[^/\\]/;
const PROTOCOL_SCRIPT_RE = /^[\s\0]*(blob|data|javascript|vbscript):$/i;
const TRAILING_SLASH_RE = /\/$|\/\?|\/#/;
const JOIN_LEADING_SLASH_RE = /^\.?\//;
function hasProtocol(inputString, opts = {}) {
  if (typeof opts === "boolean") {
    opts = { acceptRelative: opts };
  }
  if (opts.strict) {
    return PROTOCOL_STRICT_REGEX.test(inputString);
  }
  return PROTOCOL_REGEX.test(inputString) || (opts.acceptRelative ? PROTOCOL_RELATIVE_REGEX.test(inputString) : false);
}
function isScriptProtocol(protocol) {
  return !!protocol && PROTOCOL_SCRIPT_RE.test(protocol);
}
function hasTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return input.endsWith("/");
  }
  return TRAILING_SLASH_RE.test(input);
}
function withoutTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return (hasTrailingSlash(input) ? input.slice(0, -1) : input) || "/";
  }
  if (!hasTrailingSlash(input, true)) {
    return input || "/";
  }
  let path = input;
  let fragment = "";
  const fragmentIndex = input.indexOf("#");
  if (fragmentIndex >= 0) {
    path = input.slice(0, fragmentIndex);
    fragment = input.slice(fragmentIndex);
  }
  const [s0, ...s] = path.split("?");
  const cleanPath = s0.endsWith("/") ? s0.slice(0, -1) : s0;
  return (cleanPath || "/") + (s.length > 0 ? `?${s.join("?")}` : "") + fragment;
}
function withTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return input.endsWith("/") ? input : input + "/";
  }
  if (hasTrailingSlash(input, true)) {
    return input || "/";
  }
  let path = input;
  let fragment = "";
  const fragmentIndex = input.indexOf("#");
  if (fragmentIndex >= 0) {
    path = input.slice(0, fragmentIndex);
    fragment = input.slice(fragmentIndex);
    if (!path) {
      return fragment;
    }
  }
  const [s0, ...s] = path.split("?");
  return s0 + "/" + (s.length > 0 ? `?${s.join("?")}` : "") + fragment;
}
function hasLeadingSlash(input = "") {
  return input.startsWith("/");
}
function withLeadingSlash(input = "") {
  return hasLeadingSlash(input) ? input : "/" + input;
}
function withBase(input, base) {
  if (isEmptyURL(base) || hasProtocol(input)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (input.startsWith(_base)) {
    return input;
  }
  return joinURL(_base, input);
}
function withoutBase(input, base) {
  if (isEmptyURL(base)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (!input.startsWith(_base)) {
    return input;
  }
  const trimmed = input.slice(_base.length);
  return trimmed[0] === "/" ? trimmed : "/" + trimmed;
}
function withQuery(input, query) {
  const parsed = parseURL(input);
  const mergedQuery = { ...parseQuery(parsed.search), ...query };
  parsed.search = stringifyQuery(mergedQuery);
  return stringifyParsedURL(parsed);
}
function getQuery$1(input) {
  return parseQuery(parseURL(input).search);
}
function isEmptyURL(url) {
  return !url || url === "/";
}
function isNonEmptyURL(url) {
  return url && url !== "/";
}
function joinURL(base, ...input) {
  let url = base || "";
  for (const segment of input.filter((url2) => isNonEmptyURL(url2))) {
    if (url) {
      const _segment = segment.replace(JOIN_LEADING_SLASH_RE, "");
      url = withTrailingSlash(url) + _segment;
    } else {
      url = segment;
    }
  }
  return url;
}
function joinRelativeURL(..._input) {
  const JOIN_SEGMENT_SPLIT_RE = /\/(?!\/)/;
  const input = _input.filter(Boolean);
  const segments = [];
  let segmentsDepth = 0;
  for (const i of input) {
    if (!i || i === "/") {
      continue;
    }
    for (const [sindex, s] of i.split(JOIN_SEGMENT_SPLIT_RE).entries()) {
      if (!s || s === ".") {
        continue;
      }
      if (s === "..") {
        if (segments.length === 1 && hasProtocol(segments[0])) {
          continue;
        }
        segments.pop();
        segmentsDepth--;
        continue;
      }
      if (sindex === 1 && segments[segments.length - 1]?.endsWith(":/")) {
        segments[segments.length - 1] += "/" + s;
        continue;
      }
      segments.push(s);
      segmentsDepth++;
    }
  }
  let url = segments.join("/");
  if (segmentsDepth >= 0) {
    if (input[0]?.startsWith("/") && !url.startsWith("/")) {
      url = "/" + url;
    } else if (input[0]?.startsWith("./") && !url.startsWith("./")) {
      url = "./" + url;
    }
  } else {
    url = "../".repeat(-1 * segmentsDepth) + url;
  }
  if (input[input.length - 1]?.endsWith("/") && !url.endsWith("/")) {
    url += "/";
  }
  return url;
}

const protocolRelative = Symbol.for("ufo:protocolRelative");
function parseURL(input = "", defaultProto) {
  const _specialProtoMatch = input.match(
    /^[\s\0]*(blob:|data:|javascript:|vbscript:)(.*)/i
  );
  if (_specialProtoMatch) {
    const [, _proto, _pathname = ""] = _specialProtoMatch;
    return {
      protocol: _proto.toLowerCase(),
      pathname: _pathname,
      href: _proto + _pathname,
      auth: "",
      host: "",
      search: "",
      hash: ""
    };
  }
  if (!hasProtocol(input, { acceptRelative: true })) {
    return parsePath(input);
  }
  const [, protocol = "", auth, hostAndPath = ""] = input.replace(/\\/g, "/").match(/^[\s\0]*([\w+.-]{2,}:)?\/\/([^/@]+@)?(.*)/) || [];
  const [, host = "", path = ""] = hostAndPath.match(/([^#/?]*)(.*)?/) || [];
  const { pathname, search, hash } = parsePath(
    path.replace(/\/(?=[A-Za-z]:)/, "")
  );
  return {
    protocol: protocol.toLowerCase(),
    auth: auth ? auth.slice(0, Math.max(0, auth.length - 1)) : "",
    host,
    pathname,
    search,
    hash,
    [protocolRelative]: !protocol
  };
}
function parsePath(input = "") {
  const [pathname = "", search = "", hash = ""] = (input.match(/([^#?]*)(\?[^#]*)?(#.*)?/) || []).splice(1);
  return {
    pathname,
    search,
    hash
  };
}
function stringifyParsedURL(parsed) {
  const pathname = parsed.pathname || "";
  const search = parsed.search ? (parsed.search.startsWith("?") ? "" : "?") + parsed.search : "";
  const hash = parsed.hash || "";
  const auth = parsed.auth ? parsed.auth + "@" : "";
  const host = parsed.host || "";
  const proto = parsed.protocol || parsed[protocolRelative] ? (parsed.protocol || "") + "//" : "";
  return proto + auth + host + pathname + search + hash;
}

const defaults = Object.freeze({
  ignoreUnknown: false,
  respectType: false,
  respectFunctionNames: false,
  respectFunctionProperties: false,
  unorderedObjects: true,
  unorderedArrays: false,
  unorderedSets: false,
  excludeKeys: void 0,
  excludeValues: void 0,
  replacer: void 0
});
function objectHash(object, options) {
  if (options) {
    options = { ...defaults, ...options };
  } else {
    options = defaults;
  }
  const hasher = createHasher(options);
  hasher.dispatch(object);
  return hasher.toString();
}
const defaultPrototypesKeys = Object.freeze([
  "prototype",
  "__proto__",
  "constructor"
]);
function createHasher(options) {
  let buff = "";
  let context = /* @__PURE__ */ new Map();
  const write = (str) => {
    buff += str;
  };
  return {
    toString() {
      return buff;
    },
    getContext() {
      return context;
    },
    dispatch(value) {
      if (options.replacer) {
        value = options.replacer(value);
      }
      const type = value === null ? "null" : typeof value;
      return this[type](value);
    },
    object(object) {
      if (object && typeof object.toJSON === "function") {
        return this.object(object.toJSON());
      }
      const objString = Object.prototype.toString.call(object);
      let objType = "";
      const objectLength = objString.length;
      if (objectLength < 10) {
        objType = "unknown:[" + objString + "]";
      } else {
        objType = objString.slice(8, objectLength - 1);
      }
      objType = objType.toLowerCase();
      let objectNumber = null;
      if ((objectNumber = context.get(object)) === void 0) {
        context.set(object, context.size);
      } else {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        write("buffer:");
        return write(object.toString("utf8"));
      }
      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this[objType]) {
          this[objType](object);
        } else if (!options.ignoreUnknown) {
          this.unkown(object, objType);
        }
      } else {
        let keys = Object.keys(object);
        if (options.unorderedObjects) {
          keys = keys.sort();
        }
        let extraKeys = [];
        if (options.respectType !== false && !isNativeFunction(object)) {
          extraKeys = defaultPrototypesKeys;
        }
        if (options.excludeKeys) {
          keys = keys.filter((key) => {
            return !options.excludeKeys(key);
          });
          extraKeys = extraKeys.filter((key) => {
            return !options.excludeKeys(key);
          });
        }
        write("object:" + (keys.length + extraKeys.length) + ":");
        const dispatchForKey = (key) => {
          this.dispatch(key);
          write(":");
          if (!options.excludeValues) {
            this.dispatch(object[key]);
          }
          write(",");
        };
        for (const key of keys) {
          dispatchForKey(key);
        }
        for (const key of extraKeys) {
          dispatchForKey(key);
        }
      }
    },
    array(arr, unordered) {
      unordered = unordered === void 0 ? options.unorderedArrays !== false : unordered;
      write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }
      const contextAdditions = /* @__PURE__ */ new Map();
      const entries = arr.map((entry) => {
        const hasher = createHasher(options);
        hasher.dispatch(entry);
        for (const [key, value] of hasher.getContext()) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      context = contextAdditions;
      entries.sort();
      return this.array(entries, false);
    },
    date(date) {
      return write("date:" + date.toJSON());
    },
    symbol(sym) {
      return write("symbol:" + sym.toString());
    },
    unkown(value, type) {
      write(type);
      if (!value) {
        return;
      }
      write(":");
      if (value && typeof value.entries === "function") {
        return this.array(
          Array.from(value.entries()),
          true
          /* ordered */
        );
      }
    },
    error(err) {
      return write("error:" + err.toString());
    },
    boolean(bool) {
      return write("bool:" + bool);
    },
    string(string) {
      write("string:" + string.length + ":");
      write(string);
    },
    function(fn) {
      write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }
      if (options.respectFunctionNames !== false) {
        this.dispatch("function-name:" + String(fn.name));
      }
      if (options.respectFunctionProperties) {
        this.object(fn);
      }
    },
    number(number) {
      return write("number:" + number);
    },
    xml(xml) {
      return write("xml:" + xml.toString());
    },
    null() {
      return write("Null");
    },
    undefined() {
      return write("Undefined");
    },
    regexp(regex) {
      return write("regex:" + regex.toString());
    },
    uint8array(arr) {
      write("uint8array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    uint8clampedarray(arr) {
      write("uint8clampedarray:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    int8array(arr) {
      write("int8array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    uint16array(arr) {
      write("uint16array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    int16array(arr) {
      write("int16array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    uint32array(arr) {
      write("uint32array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    int32array(arr) {
      write("int32array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    float32array(arr) {
      write("float32array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    float64array(arr) {
      write("float64array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    arraybuffer(arr) {
      write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    },
    url(url) {
      return write("url:" + url.toString());
    },
    map(map) {
      write("map:");
      const arr = [...map];
      return this.array(arr, options.unorderedSets !== false);
    },
    set(set) {
      write("set:");
      const arr = [...set];
      return this.array(arr, options.unorderedSets !== false);
    },
    file(file) {
      write("file:");
      return this.dispatch([file.name, file.size, file.type, file.lastModfied]);
    },
    blob() {
      if (options.ignoreUnknown) {
        return write("[blob]");
      }
      throw new Error(
        'Hashing Blob objects is currently not supported\nUse "options.replacer" or "options.ignoreUnknown"\n'
      );
    },
    domwindow() {
      return write("domwindow");
    },
    bigint(number) {
      return write("bigint:" + number.toString());
    },
    /* Node.js standard native objects */
    process() {
      return write("process");
    },
    timer() {
      return write("timer");
    },
    pipe() {
      return write("pipe");
    },
    tcp() {
      return write("tcp");
    },
    udp() {
      return write("udp");
    },
    tty() {
      return write("tty");
    },
    statwatcher() {
      return write("statwatcher");
    },
    securecontext() {
      return write("securecontext");
    },
    connection() {
      return write("connection");
    },
    zlib() {
      return write("zlib");
    },
    context() {
      return write("context");
    },
    nodescript() {
      return write("nodescript");
    },
    httpparser() {
      return write("httpparser");
    },
    dataview() {
      return write("dataview");
    },
    signal() {
      return write("signal");
    },
    fsevent() {
      return write("fsevent");
    },
    tlswrap() {
      return write("tlswrap");
    }
  };
}
const nativeFunc = "[native code] }";
const nativeFuncLength = nativeFunc.length;
function isNativeFunction(f) {
  if (typeof f !== "function") {
    return false;
  }
  return Function.prototype.toString.call(f).slice(-nativeFuncLength) === nativeFunc;
}

class WordArray {
  constructor(words, sigBytes) {
    words = this.words = words || [];
    this.sigBytes = sigBytes === void 0 ? words.length * 4 : sigBytes;
  }
  toString(encoder) {
    return (encoder || Hex).stringify(this);
  }
  concat(wordArray) {
    this.clamp();
    if (this.sigBytes % 4) {
      for (let i = 0; i < wordArray.sigBytes; i++) {
        const thatByte = wordArray.words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
        this.words[this.sigBytes + i >>> 2] |= thatByte << 24 - (this.sigBytes + i) % 4 * 8;
      }
    } else {
      for (let j = 0; j < wordArray.sigBytes; j += 4) {
        this.words[this.sigBytes + j >>> 2] = wordArray.words[j >>> 2];
      }
    }
    this.sigBytes += wordArray.sigBytes;
    return this;
  }
  clamp() {
    this.words[this.sigBytes >>> 2] &= 4294967295 << 32 - this.sigBytes % 4 * 8;
    this.words.length = Math.ceil(this.sigBytes / 4);
  }
  clone() {
    return new WordArray([...this.words]);
  }
}
const Hex = {
  stringify(wordArray) {
    const hexChars = [];
    for (let i = 0; i < wordArray.sigBytes; i++) {
      const bite = wordArray.words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
      hexChars.push((bite >>> 4).toString(16), (bite & 15).toString(16));
    }
    return hexChars.join("");
  }
};
const Base64 = {
  stringify(wordArray) {
    const keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const base64Chars = [];
    for (let i = 0; i < wordArray.sigBytes; i += 3) {
      const byte1 = wordArray.words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
      const byte2 = wordArray.words[i + 1 >>> 2] >>> 24 - (i + 1) % 4 * 8 & 255;
      const byte3 = wordArray.words[i + 2 >>> 2] >>> 24 - (i + 2) % 4 * 8 & 255;
      const triplet = byte1 << 16 | byte2 << 8 | byte3;
      for (let j = 0; j < 4 && i * 8 + j * 6 < wordArray.sigBytes * 8; j++) {
        base64Chars.push(keyStr.charAt(triplet >>> 6 * (3 - j) & 63));
      }
    }
    return base64Chars.join("");
  }
};
const Latin1 = {
  parse(latin1Str) {
    const latin1StrLength = latin1Str.length;
    const words = [];
    for (let i = 0; i < latin1StrLength; i++) {
      words[i >>> 2] |= (latin1Str.charCodeAt(i) & 255) << 24 - i % 4 * 8;
    }
    return new WordArray(words, latin1StrLength);
  }
};
const Utf8 = {
  parse(utf8Str) {
    return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
  }
};
class BufferedBlockAlgorithm {
  constructor() {
    this._data = new WordArray();
    this._nDataBytes = 0;
    this._minBufferSize = 0;
    this.blockSize = 512 / 32;
  }
  reset() {
    this._data = new WordArray();
    this._nDataBytes = 0;
  }
  _append(data) {
    if (typeof data === "string") {
      data = Utf8.parse(data);
    }
    this._data.concat(data);
    this._nDataBytes += data.sigBytes;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _doProcessBlock(_dataWords, _offset) {
  }
  _process(doFlush) {
    let processedWords;
    let nBlocksReady = this._data.sigBytes / (this.blockSize * 4);
    if (doFlush) {
      nBlocksReady = Math.ceil(nBlocksReady);
    } else {
      nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
    }
    const nWordsReady = nBlocksReady * this.blockSize;
    const nBytesReady = Math.min(nWordsReady * 4, this._data.sigBytes);
    if (nWordsReady) {
      for (let offset = 0; offset < nWordsReady; offset += this.blockSize) {
        this._doProcessBlock(this._data.words, offset);
      }
      processedWords = this._data.words.splice(0, nWordsReady);
      this._data.sigBytes -= nBytesReady;
    }
    return new WordArray(processedWords, nBytesReady);
  }
}
class Hasher extends BufferedBlockAlgorithm {
  update(messageUpdate) {
    this._append(messageUpdate);
    this._process();
    return this;
  }
  finalize(messageUpdate) {
    if (messageUpdate) {
      this._append(messageUpdate);
    }
  }
}

const H = [
  1779033703,
  -1150833019,
  1013904242,
  -1521486534,
  1359893119,
  -1694144372,
  528734635,
  1541459225
];
const K = [
  1116352408,
  1899447441,
  -1245643825,
  -373957723,
  961987163,
  1508970993,
  -1841331548,
  -1424204075,
  -670586216,
  310598401,
  607225278,
  1426881987,
  1925078388,
  -2132889090,
  -1680079193,
  -1046744716,
  -459576895,
  -272742522,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  -1740746414,
  -1473132947,
  -1341970488,
  -1084653625,
  -958395405,
  -710438585,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  -2117940946,
  -1838011259,
  -1564481375,
  -1474664885,
  -1035236496,
  -949202525,
  -778901479,
  -694614492,
  -200395387,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  -2067236844,
  -1933114872,
  -1866530822,
  -1538233109,
  -1090935817,
  -965641998
];
const W = [];
class SHA256 extends Hasher {
  constructor() {
    super(...arguments);
    this._hash = new WordArray([...H]);
  }
  reset() {
    super.reset();
    this._hash = new WordArray([...H]);
  }
  _doProcessBlock(M, offset) {
    const H2 = this._hash.words;
    let a = H2[0];
    let b = H2[1];
    let c = H2[2];
    let d = H2[3];
    let e = H2[4];
    let f = H2[5];
    let g = H2[6];
    let h = H2[7];
    for (let i = 0; i < 64; i++) {
      if (i < 16) {
        W[i] = M[offset + i] | 0;
      } else {
        const gamma0x = W[i - 15];
        const gamma0 = (gamma0x << 25 | gamma0x >>> 7) ^ (gamma0x << 14 | gamma0x >>> 18) ^ gamma0x >>> 3;
        const gamma1x = W[i - 2];
        const gamma1 = (gamma1x << 15 | gamma1x >>> 17) ^ (gamma1x << 13 | gamma1x >>> 19) ^ gamma1x >>> 10;
        W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16];
      }
      const ch = e & f ^ ~e & g;
      const maj = a & b ^ a & c ^ b & c;
      const sigma0 = (a << 30 | a >>> 2) ^ (a << 19 | a >>> 13) ^ (a << 10 | a >>> 22);
      const sigma1 = (e << 26 | e >>> 6) ^ (e << 21 | e >>> 11) ^ (e << 7 | e >>> 25);
      const t1 = h + sigma1 + ch + K[i] + W[i];
      const t2 = sigma0 + maj;
      h = g;
      g = f;
      f = e;
      e = d + t1 | 0;
      d = c;
      c = b;
      b = a;
      a = t1 + t2 | 0;
    }
    H2[0] = H2[0] + a | 0;
    H2[1] = H2[1] + b | 0;
    H2[2] = H2[2] + c | 0;
    H2[3] = H2[3] + d | 0;
    H2[4] = H2[4] + e | 0;
    H2[5] = H2[5] + f | 0;
    H2[6] = H2[6] + g | 0;
    H2[7] = H2[7] + h | 0;
  }
  finalize(messageUpdate) {
    super.finalize(messageUpdate);
    const nBitsTotal = this._nDataBytes * 8;
    const nBitsLeft = this._data.sigBytes * 8;
    this._data.words[nBitsLeft >>> 5] |= 128 << 24 - nBitsLeft % 32;
    this._data.words[(nBitsLeft + 64 >>> 9 << 4) + 14] = Math.floor(
      nBitsTotal / 4294967296
    );
    this._data.words[(nBitsLeft + 64 >>> 9 << 4) + 15] = nBitsTotal;
    this._data.sigBytes = this._data.words.length * 4;
    this._process();
    return this._hash;
  }
}
function sha256base64(message) {
  return new SHA256().finalize(message).toString(Base64);
}

function hash(object, options = {}) {
  const hashed = typeof object === "string" ? object : objectHash(object, options);
  return sha256base64(hashed).slice(0, 10);
}

const NODE_TYPES = {
  NORMAL: 0,
  WILDCARD: 1,
  PLACEHOLDER: 2
};

function createRouter$1(options = {}) {
  const ctx = {
    options,
    rootNode: createRadixNode(),
    staticRoutesMap: {}
  };
  const normalizeTrailingSlash = (p) => options.strictTrailingSlash ? p : p.replace(/\/$/, "") || "/";
  if (options.routes) {
    for (const path in options.routes) {
      insert(ctx, normalizeTrailingSlash(path), options.routes[path]);
    }
  }
  return {
    ctx,
    lookup: (path) => lookup(ctx, normalizeTrailingSlash(path)),
    insert: (path, data) => insert(ctx, normalizeTrailingSlash(path), data),
    remove: (path) => remove(ctx, normalizeTrailingSlash(path))
  };
}
function lookup(ctx, path) {
  const staticPathNode = ctx.staticRoutesMap[path];
  if (staticPathNode) {
    return staticPathNode.data;
  }
  const sections = path.split("/");
  const params = {};
  let paramsFound = false;
  let wildcardNode = null;
  let node = ctx.rootNode;
  let wildCardParam = null;
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (node.wildcardChildNode !== null) {
      wildcardNode = node.wildcardChildNode;
      wildCardParam = sections.slice(i).join("/");
    }
    const nextNode = node.children.get(section);
    if (nextNode === void 0) {
      if (node && node.placeholderChildren.length > 1) {
        const remaining = sections.length - i;
        node = node.placeholderChildren.find((c) => c.maxDepth === remaining) || null;
      } else {
        node = node.placeholderChildren[0] || null;
      }
      if (!node) {
        break;
      }
      if (node.paramName) {
        params[node.paramName] = section;
      }
      paramsFound = true;
    } else {
      node = nextNode;
    }
  }
  if ((node === null || node.data === null) && wildcardNode !== null) {
    node = wildcardNode;
    params[node.paramName || "_"] = wildCardParam;
    paramsFound = true;
  }
  if (!node) {
    return null;
  }
  if (paramsFound) {
    return {
      ...node.data,
      params: paramsFound ? params : void 0
    };
  }
  return node.data;
}
function insert(ctx, path, data) {
  let isStaticRoute = true;
  const sections = path.split("/");
  let node = ctx.rootNode;
  let _unnamedPlaceholderCtr = 0;
  const matchedNodes = [node];
  for (const section of sections) {
    let childNode;
    if (childNode = node.children.get(section)) {
      node = childNode;
    } else {
      const type = getNodeType(section);
      childNode = createRadixNode({ type, parent: node });
      node.children.set(section, childNode);
      if (type === NODE_TYPES.PLACEHOLDER) {
        childNode.paramName = section === "*" ? `_${_unnamedPlaceholderCtr++}` : section.slice(1);
        node.placeholderChildren.push(childNode);
        isStaticRoute = false;
      } else if (type === NODE_TYPES.WILDCARD) {
        node.wildcardChildNode = childNode;
        childNode.paramName = section.slice(
          3
          /* "**:" */
        ) || "_";
        isStaticRoute = false;
      }
      matchedNodes.push(childNode);
      node = childNode;
    }
  }
  for (const [depth, node2] of matchedNodes.entries()) {
    node2.maxDepth = Math.max(matchedNodes.length - depth, node2.maxDepth || 0);
  }
  node.data = data;
  if (isStaticRoute === true) {
    ctx.staticRoutesMap[path] = node;
  }
  return node;
}
function remove(ctx, path) {
  let success = false;
  const sections = path.split("/");
  let node = ctx.rootNode;
  for (const section of sections) {
    node = node.children.get(section);
    if (!node) {
      return success;
    }
  }
  if (node.data) {
    const lastSection = sections.at(-1) || "";
    node.data = null;
    if (Object.keys(node.children).length === 0 && node.parent) {
      node.parent.children.delete(lastSection);
      node.parent.wildcardChildNode = null;
      node.parent.placeholderChildren = [];
    }
    success = true;
  }
  return success;
}
function createRadixNode(options = {}) {
  return {
    type: options.type || NODE_TYPES.NORMAL,
    maxDepth: 0,
    parent: options.parent || null,
    children: /* @__PURE__ */ new Map(),
    data: options.data || null,
    paramName: options.paramName || null,
    wildcardChildNode: null,
    placeholderChildren: []
  };
}
function getNodeType(str) {
  if (str.startsWith("**")) {
    return NODE_TYPES.WILDCARD;
  }
  if (str[0] === ":" || str === "*") {
    return NODE_TYPES.PLACEHOLDER;
  }
  return NODE_TYPES.NORMAL;
}

function toRouteMatcher(router) {
  const table = _routerNodeToTable("", router.ctx.rootNode);
  return _createMatcher(table, router.ctx.options.strictTrailingSlash);
}
function _createMatcher(table, strictTrailingSlash) {
  return {
    ctx: { table },
    matchAll: (path) => _matchRoutes(path, table, strictTrailingSlash)
  };
}
function _createRouteTable() {
  return {
    static: /* @__PURE__ */ new Map(),
    wildcard: /* @__PURE__ */ new Map(),
    dynamic: /* @__PURE__ */ new Map()
  };
}
function _matchRoutes(path, table, strictTrailingSlash) {
  if (strictTrailingSlash !== true && path.endsWith("/")) {
    path = path.slice(0, -1) || "/";
  }
  const matches = [];
  for (const [key, value] of _sortRoutesMap(table.wildcard)) {
    if (path === key || path.startsWith(key + "/")) {
      matches.push(value);
    }
  }
  for (const [key, value] of _sortRoutesMap(table.dynamic)) {
    if (path.startsWith(key + "/")) {
      const subPath = "/" + path.slice(key.length).split("/").splice(2).join("/");
      matches.push(..._matchRoutes(subPath, value));
    }
  }
  const staticMatch = table.static.get(path);
  if (staticMatch) {
    matches.push(staticMatch);
  }
  return matches.filter(Boolean);
}
function _sortRoutesMap(m) {
  return [...m.entries()].sort((a, b) => a[0].length - b[0].length);
}
function _routerNodeToTable(initialPath, initialNode) {
  const table = _createRouteTable();
  function _addNode(path, node) {
    if (path) {
      if (node.type === NODE_TYPES.NORMAL && !(path.includes("*") || path.includes(":"))) {
        if (node.data) {
          table.static.set(path, node.data);
        }
      } else if (node.type === NODE_TYPES.WILDCARD) {
        table.wildcard.set(path.replace("/**", ""), node.data);
      } else if (node.type === NODE_TYPES.PLACEHOLDER) {
        const subTable = _routerNodeToTable("", node);
        if (node.data) {
          subTable.static.set("/", node.data);
        }
        table.dynamic.set(path.replace(/\/\*|\/:\w+/, ""), subTable);
        return;
      }
    }
    for (const [childPath, child] of node.children.entries()) {
      _addNode(`${path}/${childPath}`.replace("//", "/"), child);
    }
  }
  _addNode(initialPath, initialNode);
  return table;
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) {
    return false;
  }
  if (Symbol.iterator in value) {
    return false;
  }
  if (Symbol.toStringTag in value) {
    return Object.prototype.toString.call(value) === "[object Module]";
  }
  return true;
}

function _defu(baseObject, defaults, namespace = ".", merger) {
  if (!isPlainObject(defaults)) {
    return _defu(baseObject, {}, namespace, merger);
  }
  const object = Object.assign({}, defaults);
  for (const key in baseObject) {
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = baseObject[key];
    if (value === null || value === void 0) {
      continue;
    }
    if (merger && merger(object, key, value, namespace)) {
      continue;
    }
    if (Array.isArray(value) && Array.isArray(object[key])) {
      object[key] = [...value, ...object[key]];
    } else if (isPlainObject(value) && isPlainObject(object[key])) {
      object[key] = _defu(
        value,
        object[key],
        (namespace ? `${namespace}.` : "") + key.toString(),
        merger
      );
    } else {
      object[key] = value;
    }
  }
  return object;
}
function createDefu(merger) {
  return (...arguments_) => (
    // eslint-disable-next-line unicorn/no-array-reduce
    arguments_.reduce((p, c) => _defu(p, c, "", merger), {})
  );
}
const defu = createDefu();
const defuFn = createDefu((object, key, currentValue) => {
  if (object[key] !== void 0 && typeof currentValue === "function") {
    object[key] = currentValue(object[key]);
    return true;
  }
});

function rawHeaders(headers) {
  const rawHeaders2 = [];
  for (const key in headers) {
    if (Array.isArray(headers[key])) {
      for (const h of headers[key]) {
        rawHeaders2.push(key, h);
      }
    } else {
      rawHeaders2.push(key, headers[key]);
    }
  }
  return rawHeaders2;
}
function mergeFns(...functions) {
  return function(...args) {
    for (const fn of functions) {
      fn(...args);
    }
  };
}
function createNotImplementedError(name) {
  throw new Error(`[unenv] ${name} is not implemented yet!`);
}

let defaultMaxListeners = 10;
let EventEmitter$1 = class EventEmitter {
  __unenv__ = true;
  _events = /* @__PURE__ */ Object.create(null);
  _maxListeners;
  static get defaultMaxListeners() {
    return defaultMaxListeners;
  }
  static set defaultMaxListeners(arg) {
    if (typeof arg !== "number" || arg < 0 || Number.isNaN(arg)) {
      throw new RangeError(
        'The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + "."
      );
    }
    defaultMaxListeners = arg;
  }
  setMaxListeners(n) {
    if (typeof n !== "number" || n < 0 || Number.isNaN(n)) {
      throw new RangeError(
        'The value of "n" is out of range. It must be a non-negative number. Received ' + n + "."
      );
    }
    this._maxListeners = n;
    return this;
  }
  getMaxListeners() {
    return _getMaxListeners(this);
  }
  emit(type, ...args) {
    if (!this._events[type] || this._events[type].length === 0) {
      return false;
    }
    if (type === "error") {
      let er;
      if (args.length > 0) {
        er = args[0];
      }
      if (er instanceof Error) {
        throw er;
      }
      const err = new Error(
        "Unhandled error." + (er ? " (" + er.message + ")" : "")
      );
      err.context = er;
      throw err;
    }
    for (const _listener of this._events[type]) {
      (_listener.listener || _listener).apply(this, args);
    }
    return true;
  }
  addListener(type, listener) {
    return _addListener(this, type, listener, false);
  }
  on(type, listener) {
    return _addListener(this, type, listener, false);
  }
  prependListener(type, listener) {
    return _addListener(this, type, listener, true);
  }
  once(type, listener) {
    return this.on(type, _wrapOnce(this, type, listener));
  }
  prependOnceListener(type, listener) {
    return this.prependListener(type, _wrapOnce(this, type, listener));
  }
  removeListener(type, listener) {
    return _removeListener(this, type, listener);
  }
  off(type, listener) {
    return this.removeListener(type, listener);
  }
  removeAllListeners(type) {
    return _removeAllListeners(this, type);
  }
  listeners(type) {
    return _listeners(this, type, true);
  }
  rawListeners(type) {
    return _listeners(this, type, false);
  }
  listenerCount(type) {
    return this.rawListeners(type).length;
  }
  eventNames() {
    return Object.keys(this._events);
  }
};
function _addListener(target, type, listener, prepend) {
  _checkListener(listener);
  if (target._events.newListener !== void 0) {
    target.emit("newListener", type, listener.listener || listener);
  }
  if (!target._events[type]) {
    target._events[type] = [];
  }
  if (prepend) {
    target._events[type].unshift(listener);
  } else {
    target._events[type].push(listener);
  }
  const maxListeners = _getMaxListeners(target);
  if (maxListeners > 0 && target._events[type].length > maxListeners && !target._events[type].warned) {
    target._events[type].warned = true;
    const warning = new Error(
      `[unenv] Possible EventEmitter memory leak detected. ${target._events[type].length} ${type} listeners added. Use emitter.setMaxListeners() to increase limit`
    );
    warning.name = "MaxListenersExceededWarning";
    warning.emitter = target;
    warning.type = type;
    warning.count = target._events[type]?.length;
    console.warn(warning);
  }
  return target;
}
function _removeListener(target, type, listener) {
  _checkListener(listener);
  if (!target._events[type] || target._events[type].length === 0) {
    return target;
  }
  const lenBeforeFilter = target._events[type].length;
  target._events[type] = target._events[type].filter((fn) => fn !== listener);
  if (lenBeforeFilter === target._events[type].length) {
    return target;
  }
  if (target._events.removeListener) {
    target.emit("removeListener", type, listener.listener || listener);
  }
  if (target._events[type].length === 0) {
    delete target._events[type];
  }
  return target;
}
function _removeAllListeners(target, type) {
  if (!target._events[type] || target._events[type].length === 0) {
    return target;
  }
  if (target._events.removeListener) {
    for (const _listener of target._events[type]) {
      target.emit("removeListener", type, _listener.listener || _listener);
    }
  }
  delete target._events[type];
  return target;
}
function _wrapOnce(target, type, listener) {
  let fired = false;
  const wrapper = (...args) => {
    if (fired) {
      return;
    }
    target.removeListener(type, wrapper);
    fired = true;
    return args.length === 0 ? listener.call(target) : listener.apply(target, args);
  };
  wrapper.listener = listener;
  return wrapper;
}
function _getMaxListeners(target) {
  return target._maxListeners ?? EventEmitter$1.defaultMaxListeners;
}
function _listeners(target, type, unwrap) {
  let listeners = target._events[type];
  if (typeof listeners === "function") {
    listeners = [listeners];
  }
  return unwrap ? listeners.map((l) => l.listener || l) : listeners;
}
function _checkListener(listener) {
  if (typeof listener !== "function") {
    throw new TypeError(
      'The "listener" argument must be of type Function. Received type ' + typeof listener
    );
  }
}

const EventEmitter = globalThis.EventEmitter || EventEmitter$1;

class _Readable extends EventEmitter {
  __unenv__ = true;
  readableEncoding = null;
  readableEnded = true;
  readableFlowing = false;
  readableHighWaterMark = 0;
  readableLength = 0;
  readableObjectMode = false;
  readableAborted = false;
  readableDidRead = false;
  closed = false;
  errored = null;
  readable = false;
  destroyed = false;
  static from(_iterable, options) {
    return new _Readable(options);
  }
  constructor(_opts) {
    super();
  }
  _read(_size) {
  }
  read(_size) {
  }
  setEncoding(_encoding) {
    return this;
  }
  pause() {
    return this;
  }
  resume() {
    return this;
  }
  isPaused() {
    return true;
  }
  unpipe(_destination) {
    return this;
  }
  unshift(_chunk, _encoding) {
  }
  wrap(_oldStream) {
    return this;
  }
  push(_chunk, _encoding) {
    return false;
  }
  _destroy(_error, _callback) {
    this.removeAllListeners();
  }
  destroy(error) {
    this.destroyed = true;
    this._destroy(error);
    return this;
  }
  pipe(_destenition, _options) {
    return {};
  }
  compose(stream, options) {
    throw new Error("[unenv] Method not implemented.");
  }
  [Symbol.asyncDispose]() {
    this.destroy();
    return Promise.resolve();
  }
  async *[Symbol.asyncIterator]() {
    throw createNotImplementedError("Readable.asyncIterator");
  }
  iterator(options) {
    throw createNotImplementedError("Readable.iterator");
  }
  map(fn, options) {
    throw createNotImplementedError("Readable.map");
  }
  filter(fn, options) {
    throw createNotImplementedError("Readable.filter");
  }
  forEach(fn, options) {
    throw createNotImplementedError("Readable.forEach");
  }
  reduce(fn, initialValue, options) {
    throw createNotImplementedError("Readable.reduce");
  }
  find(fn, options) {
    throw createNotImplementedError("Readable.find");
  }
  findIndex(fn, options) {
    throw createNotImplementedError("Readable.findIndex");
  }
  some(fn, options) {
    throw createNotImplementedError("Readable.some");
  }
  toArray(options) {
    throw createNotImplementedError("Readable.toArray");
  }
  every(fn, options) {
    throw createNotImplementedError("Readable.every");
  }
  flatMap(fn, options) {
    throw createNotImplementedError("Readable.flatMap");
  }
  drop(limit, options) {
    throw createNotImplementedError("Readable.drop");
  }
  take(limit, options) {
    throw createNotImplementedError("Readable.take");
  }
  asIndexedPairs(options) {
    throw createNotImplementedError("Readable.asIndexedPairs");
  }
}
const Readable = globalThis.Readable || _Readable;

class _Writable extends EventEmitter {
  __unenv__ = true;
  writable = true;
  writableEnded = false;
  writableFinished = false;
  writableHighWaterMark = 0;
  writableLength = 0;
  writableObjectMode = false;
  writableCorked = 0;
  closed = false;
  errored = null;
  writableNeedDrain = false;
  destroyed = false;
  _data;
  _encoding = "utf-8";
  constructor(_opts) {
    super();
  }
  pipe(_destenition, _options) {
    return {};
  }
  _write(chunk, encoding, callback) {
    if (this.writableEnded) {
      if (callback) {
        callback();
      }
      return;
    }
    if (this._data === void 0) {
      this._data = chunk;
    } else {
      const a = typeof this._data === "string" ? Buffer.from(this._data, this._encoding || encoding || "utf8") : this._data;
      const b = typeof chunk === "string" ? Buffer.from(chunk, encoding || this._encoding || "utf8") : chunk;
      this._data = Buffer.concat([a, b]);
    }
    this._encoding = encoding;
    if (callback) {
      callback();
    }
  }
  _writev(_chunks, _callback) {
  }
  _destroy(_error, _callback) {
  }
  _final(_callback) {
  }
  write(chunk, arg2, arg3) {
    const encoding = typeof arg2 === "string" ? this._encoding : "utf-8";
    const cb = typeof arg2 === "function" ? arg2 : typeof arg3 === "function" ? arg3 : void 0;
    this._write(chunk, encoding, cb);
    return true;
  }
  setDefaultEncoding(_encoding) {
    return this;
  }
  end(arg1, arg2, arg3) {
    const callback = typeof arg1 === "function" ? arg1 : typeof arg2 === "function" ? arg2 : typeof arg3 === "function" ? arg3 : void 0;
    if (this.writableEnded) {
      if (callback) {
        callback();
      }
      return this;
    }
    const data = arg1 === callback ? void 0 : arg1;
    if (data) {
      const encoding = arg2 === callback ? void 0 : arg2;
      this.write(data, encoding, callback);
    }
    this.writableEnded = true;
    this.writableFinished = true;
    this.emit("close");
    this.emit("finish");
    return this;
  }
  cork() {
  }
  uncork() {
  }
  destroy(_error) {
    this.destroyed = true;
    delete this._data;
    this.removeAllListeners();
    return this;
  }
  compose(stream, options) {
    throw new Error("[h3] Method not implemented.");
  }
}
const Writable = globalThis.Writable || _Writable;

const __Duplex = class {
  allowHalfOpen = true;
  _destroy;
  constructor(readable = new Readable(), writable = new Writable()) {
    Object.assign(this, readable);
    Object.assign(this, writable);
    this._destroy = mergeFns(readable._destroy, writable._destroy);
  }
};
function getDuplex() {
  Object.assign(__Duplex.prototype, Readable.prototype);
  Object.assign(__Duplex.prototype, Writable.prototype);
  return __Duplex;
}
const _Duplex = /* @__PURE__ */ getDuplex();
const Duplex = globalThis.Duplex || _Duplex;

class Socket extends Duplex {
  __unenv__ = true;
  bufferSize = 0;
  bytesRead = 0;
  bytesWritten = 0;
  connecting = false;
  destroyed = false;
  pending = false;
  localAddress = "";
  localPort = 0;
  remoteAddress = "";
  remoteFamily = "";
  remotePort = 0;
  autoSelectFamilyAttemptedAddresses = [];
  readyState = "readOnly";
  constructor(_options) {
    super();
  }
  write(_buffer, _arg1, _arg2) {
    return false;
  }
  connect(_arg1, _arg2, _arg3) {
    return this;
  }
  end(_arg1, _arg2, _arg3) {
    return this;
  }
  setEncoding(_encoding) {
    return this;
  }
  pause() {
    return this;
  }
  resume() {
    return this;
  }
  setTimeout(_timeout, _callback) {
    return this;
  }
  setNoDelay(_noDelay) {
    return this;
  }
  setKeepAlive(_enable, _initialDelay) {
    return this;
  }
  address() {
    return {};
  }
  unref() {
    return this;
  }
  ref() {
    return this;
  }
  destroySoon() {
    this.destroy();
  }
  resetAndDestroy() {
    const err = new Error("ERR_SOCKET_CLOSED");
    err.code = "ERR_SOCKET_CLOSED";
    this.destroy(err);
    return this;
  }
}

class IncomingMessage extends Readable {
  __unenv__ = {};
  aborted = false;
  httpVersion = "1.1";
  httpVersionMajor = 1;
  httpVersionMinor = 1;
  complete = true;
  connection;
  socket;
  headers = {};
  trailers = {};
  method = "GET";
  url = "/";
  statusCode = 200;
  statusMessage = "";
  closed = false;
  errored = null;
  readable = false;
  constructor(socket) {
    super();
    this.socket = this.connection = socket || new Socket();
  }
  get rawHeaders() {
    return rawHeaders(this.headers);
  }
  get rawTrailers() {
    return [];
  }
  setTimeout(_msecs, _callback) {
    return this;
  }
  get headersDistinct() {
    return _distinct(this.headers);
  }
  get trailersDistinct() {
    return _distinct(this.trailers);
  }
}
function _distinct(obj) {
  const d = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key) {
      d[key] = (Array.isArray(value) ? value : [value]).filter(
        Boolean
      );
    }
  }
  return d;
}

class ServerResponse extends Writable {
  __unenv__ = true;
  statusCode = 200;
  statusMessage = "";
  upgrading = false;
  chunkedEncoding = false;
  shouldKeepAlive = false;
  useChunkedEncodingByDefault = false;
  sendDate = false;
  finished = false;
  headersSent = false;
  strictContentLength = false;
  connection = null;
  socket = null;
  req;
  _headers = {};
  constructor(req) {
    super();
    this.req = req;
  }
  assignSocket(socket) {
    socket._httpMessage = this;
    this.socket = socket;
    this.connection = socket;
    this.emit("socket", socket);
    this._flush();
  }
  _flush() {
    this.flushHeaders();
  }
  detachSocket(_socket) {
  }
  writeContinue(_callback) {
  }
  writeHead(statusCode, arg1, arg2) {
    if (statusCode) {
      this.statusCode = statusCode;
    }
    if (typeof arg1 === "string") {
      this.statusMessage = arg1;
      arg1 = void 0;
    }
    const headers = arg2 || arg1;
    if (headers) {
      if (Array.isArray(headers)) ; else {
        for (const key in headers) {
          this.setHeader(key, headers[key]);
        }
      }
    }
    this.headersSent = true;
    return this;
  }
  writeProcessing() {
  }
  setTimeout(_msecs, _callback) {
    return this;
  }
  appendHeader(name, value) {
    name = name.toLowerCase();
    const current = this._headers[name];
    const all = [
      ...Array.isArray(current) ? current : [current],
      ...Array.isArray(value) ? value : [value]
    ].filter(Boolean);
    this._headers[name] = all.length > 1 ? all : all[0];
    return this;
  }
  setHeader(name, value) {
    this._headers[name.toLowerCase()] = value;
    return this;
  }
  getHeader(name) {
    return this._headers[name.toLowerCase()];
  }
  getHeaders() {
    return this._headers;
  }
  getHeaderNames() {
    return Object.keys(this._headers);
  }
  hasHeader(name) {
    return name.toLowerCase() in this._headers;
  }
  removeHeader(name) {
    delete this._headers[name.toLowerCase()];
  }
  addTrailers(_headers) {
  }
  flushHeaders() {
  }
  writeEarlyHints(_headers, cb) {
    if (typeof cb === "function") {
      cb();
    }
  }
}

function useBase(base, handler) {
  base = withoutTrailingSlash(base);
  if (!base || base === "/") {
    return handler;
  }
  return eventHandler(async (event) => {
    event.node.req.originalUrl = event.node.req.originalUrl || event.node.req.url || "/";
    const _path = event._path || event.node.req.url || "/";
    event._path = withoutBase(event.path || "/", base);
    event.node.req.url = event._path;
    try {
      return await handler(event);
    } finally {
      event._path = event.node.req.url = _path;
    }
  });
}

function hasProp(obj, prop) {
  try {
    return prop in obj;
  } catch {
    return false;
  }
}

var __defProp$2 = Object.defineProperty;
var __defNormalProp$2 = (obj, key, value) => key in obj ? __defProp$2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$2 = (obj, key, value) => {
  __defNormalProp$2(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class H3Error extends Error {
  constructor(message, opts = {}) {
    super(message, opts);
    __publicField$2(this, "statusCode", 500);
    __publicField$2(this, "fatal", false);
    __publicField$2(this, "unhandled", false);
    __publicField$2(this, "statusMessage");
    __publicField$2(this, "data");
    __publicField$2(this, "cause");
    if (opts.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
  toJSON() {
    const obj = {
      message: this.message,
      statusCode: sanitizeStatusCode(this.statusCode, 500)
    };
    if (this.statusMessage) {
      obj.statusMessage = sanitizeStatusMessage(this.statusMessage);
    }
    if (this.data !== void 0) {
      obj.data = this.data;
    }
    return obj;
  }
}
__publicField$2(H3Error, "__h3_error__", true);
function createError$1(input) {
  if (typeof input === "string") {
    return new H3Error(input);
  }
  if (isError(input)) {
    return input;
  }
  const err = new H3Error(input.message ?? input.statusMessage ?? "", {
    cause: input.cause || input
  });
  if (hasProp(input, "stack")) {
    try {
      Object.defineProperty(err, "stack", {
        get() {
          return input.stack;
        }
      });
    } catch {
      try {
        err.stack = input.stack;
      } catch {
      }
    }
  }
  if (input.data) {
    err.data = input.data;
  }
  if (input.statusCode) {
    err.statusCode = sanitizeStatusCode(input.statusCode, err.statusCode);
  } else if (input.status) {
    err.statusCode = sanitizeStatusCode(input.status, err.statusCode);
  }
  if (input.statusMessage) {
    err.statusMessage = input.statusMessage;
  } else if (input.statusText) {
    err.statusMessage = input.statusText;
  }
  if (err.statusMessage) {
    const originalMessage = err.statusMessage;
    const sanitizedMessage = sanitizeStatusMessage(err.statusMessage);
    if (sanitizedMessage !== originalMessage) {
      console.warn(
        "[h3] Please prefer using `message` for longer error messages instead of `statusMessage`. In the future, `statusMessage` will be sanitized by default."
      );
    }
  }
  if (input.fatal !== void 0) {
    err.fatal = input.fatal;
  }
  if (input.unhandled !== void 0) {
    err.unhandled = input.unhandled;
  }
  return err;
}
function sendError(event, error, debug) {
  if (event.handled) {
    return;
  }
  const h3Error = isError(error) ? error : createError$1(error);
  const responseBody = {
    statusCode: h3Error.statusCode,
    statusMessage: h3Error.statusMessage,
    stack: [],
    data: h3Error.data
  };
  if (debug) {
    responseBody.stack = (h3Error.stack || "").split("\n").map((l) => l.trim());
  }
  if (event.handled) {
    return;
  }
  const _code = Number.parseInt(h3Error.statusCode);
  setResponseStatus(event, _code, h3Error.statusMessage);
  event.node.res.setHeader("content-type", MIMES.json);
  event.node.res.end(JSON.stringify(responseBody, void 0, 2));
}
function isError(input) {
  return input?.constructor?.__h3_error__ === true;
}

function getQuery(event) {
  return getQuery$1(event.path || "");
}
function isMethod(event, expected, allowHead) {
  if (typeof expected === "string") {
    if (event.method === expected) {
      return true;
    }
  } else if (expected.includes(event.method)) {
    return true;
  }
  return false;
}
function assertMethod(event, expected, allowHead) {
  if (!isMethod(event, expected)) {
    throw createError$1({
      statusCode: 405,
      statusMessage: "HTTP method is not allowed."
    });
  }
}
function getRequestHeaders(event) {
  const _headers = {};
  for (const key in event.node.req.headers) {
    const val = event.node.req.headers[key];
    _headers[key] = Array.isArray(val) ? val.filter(Boolean).join(", ") : val;
  }
  return _headers;
}
function getRequestHeader(event, name) {
  const headers = getRequestHeaders(event);
  const value = headers[name.toLowerCase()];
  return value;
}

const RawBodySymbol = Symbol.for("h3RawBody");
const PayloadMethods$1 = ["PATCH", "POST", "PUT", "DELETE"];
function readRawBody(event, encoding = "utf8") {
  assertMethod(event, PayloadMethods$1);
  const _rawBody = event._requestBody || event.web?.request?.body || event.node.req[RawBodySymbol] || event.node.req.rawBody || event.node.req.body;
  if (_rawBody) {
    const promise2 = Promise.resolve(_rawBody).then((_resolved) => {
      if (Buffer.isBuffer(_resolved)) {
        return _resolved;
      }
      if (typeof _resolved.pipeTo === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.pipeTo(
            new WritableStream({
              write(chunk) {
                chunks.push(chunk);
              },
              close() {
                resolve(Buffer.concat(chunks));
              },
              abort(reason) {
                reject(reason);
              }
            })
          ).catch(reject);
        });
      } else if (typeof _resolved.pipe === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.on("data", (chunk) => {
            chunks.push(chunk);
          }).on("end", () => {
            resolve(Buffer.concat(chunks));
          }).on("error", reject);
        });
      }
      if (_resolved.constructor === Object) {
        return Buffer.from(JSON.stringify(_resolved));
      }
      return Buffer.from(_resolved);
    });
    return encoding ? promise2.then((buff) => buff.toString(encoding)) : promise2;
  }
  if (!Number.parseInt(event.node.req.headers["content-length"] || "")) {
    return Promise.resolve(void 0);
  }
  const promise = event.node.req[RawBodySymbol] = new Promise(
    (resolve, reject) => {
      const bodyData = [];
      event.node.req.on("error", (err) => {
        reject(err);
      }).on("data", (chunk) => {
        bodyData.push(chunk);
      }).on("end", () => {
        resolve(Buffer.concat(bodyData));
      });
    }
  );
  const result = encoding ? promise.then((buff) => buff.toString(encoding)) : promise;
  return result;
}
function getRequestWebStream(event) {
  if (!PayloadMethods$1.includes(event.method)) {
    return;
  }
  const bodyStream = event.web?.request?.body || event._requestBody;
  if (bodyStream) {
    return bodyStream;
  }
  const _hasRawBody = RawBodySymbol in event.node.req || "rawBody" in event.node.req || "body" in event.node.req || "__unenv__" in event.node.req;
  if (_hasRawBody) {
    return new ReadableStream({
      async start(controller) {
        const _rawBody = await readRawBody(event, false);
        if (_rawBody) {
          controller.enqueue(_rawBody);
        }
        controller.close();
      }
    });
  }
  return new ReadableStream({
    start: (controller) => {
      event.node.req.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      event.node.req.on("end", () => {
        controller.close();
      });
      event.node.req.on("error", (err) => {
        controller.error(err);
      });
    }
  });
}

function handleCacheHeaders(event, opts) {
  const cacheControls = ["public", ...opts.cacheControls || []];
  let cacheMatched = false;
  if (opts.maxAge !== void 0) {
    cacheControls.push(`max-age=${+opts.maxAge}`, `s-maxage=${+opts.maxAge}`);
  }
  if (opts.modifiedTime) {
    const modifiedTime = new Date(opts.modifiedTime);
    const ifModifiedSince = event.node.req.headers["if-modified-since"];
    event.node.res.setHeader("last-modified", modifiedTime.toUTCString());
    if (ifModifiedSince && new Date(ifModifiedSince) >= opts.modifiedTime) {
      cacheMatched = true;
    }
  }
  if (opts.etag) {
    event.node.res.setHeader("etag", opts.etag);
    const ifNonMatch = event.node.req.headers["if-none-match"];
    if (ifNonMatch === opts.etag) {
      cacheMatched = true;
    }
  }
  event.node.res.setHeader("cache-control", cacheControls.join(", "));
  if (cacheMatched) {
    event.node.res.statusCode = 304;
    if (!event.handled) {
      event.node.res.end();
    }
    return true;
  }
  return false;
}

const MIMES = {
  html: "text/html",
  json: "application/json"
};

const DISALLOWED_STATUS_CHARS = /[^\u0009\u0020-\u007E]/g;
function sanitizeStatusMessage(statusMessage = "") {
  return statusMessage.replace(DISALLOWED_STATUS_CHARS, "");
}
function sanitizeStatusCode(statusCode, defaultStatusCode = 200) {
  if (!statusCode) {
    return defaultStatusCode;
  }
  if (typeof statusCode === "string") {
    statusCode = Number.parseInt(statusCode, 10);
  }
  if (statusCode < 100 || statusCode > 999) {
    return defaultStatusCode;
  }
  return statusCode;
}
function splitCookiesString(cookiesString) {
  if (Array.isArray(cookiesString)) {
    return cookiesString.flatMap((c) => splitCookiesString(c));
  }
  if (typeof cookiesString !== "string") {
    return [];
  }
  const cookiesStrings = [];
  let pos = 0;
  let start;
  let ch;
  let lastComma;
  let nextStart;
  let cookiesSeparatorFound;
  const skipWhitespace = () => {
    while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) {
      pos += 1;
    }
    return pos < cookiesString.length;
  };
  const notSpecialChar = () => {
    ch = cookiesString.charAt(pos);
    return ch !== "=" && ch !== ";" && ch !== ",";
  };
  while (pos < cookiesString.length) {
    start = pos;
    cookiesSeparatorFound = false;
    while (skipWhitespace()) {
      ch = cookiesString.charAt(pos);
      if (ch === ",") {
        lastComma = pos;
        pos += 1;
        skipWhitespace();
        nextStart = pos;
        while (pos < cookiesString.length && notSpecialChar()) {
          pos += 1;
        }
        if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
          cookiesSeparatorFound = true;
          pos = nextStart;
          cookiesStrings.push(cookiesString.slice(start, lastComma));
          start = pos;
        } else {
          pos = lastComma + 1;
        }
      } else {
        pos += 1;
      }
    }
    if (!cookiesSeparatorFound || pos >= cookiesString.length) {
      cookiesStrings.push(cookiesString.slice(start, cookiesString.length));
    }
  }
  return cookiesStrings;
}

const defer = typeof setImmediate === "undefined" ? (fn) => fn() : setImmediate;
function send(event, data, type) {
  if (type) {
    defaultContentType(event, type);
  }
  return new Promise((resolve) => {
    defer(() => {
      if (!event.handled) {
        event.node.res.end(data);
      }
      resolve();
    });
  });
}
function sendNoContent(event, code) {
  if (event.handled) {
    return;
  }
  if (!code && event.node.res.statusCode !== 200) {
    code = event.node.res.statusCode;
  }
  const _code = sanitizeStatusCode(code, 204);
  if (_code === 204) {
    event.node.res.removeHeader("content-length");
  }
  event.node.res.writeHead(_code);
  event.node.res.end();
}
function setResponseStatus(event, code, text) {
  if (code) {
    event.node.res.statusCode = sanitizeStatusCode(
      code,
      event.node.res.statusCode
    );
  }
  if (text) {
    event.node.res.statusMessage = sanitizeStatusMessage(text);
  }
}
function getResponseStatus(event) {
  return event.node.res.statusCode;
}
function getResponseStatusText(event) {
  return event.node.res.statusMessage;
}
function defaultContentType(event, type) {
  if (type && event.node.res.statusCode !== 304 && !event.node.res.getHeader("content-type")) {
    event.node.res.setHeader("content-type", type);
  }
}
function sendRedirect(event, location, code = 302) {
  event.node.res.statusCode = sanitizeStatusCode(
    code,
    event.node.res.statusCode
  );
  event.node.res.setHeader("location", location);
  const encodedLoc = location.replace(/"/g, "%22");
  const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`;
  return send(event, html, MIMES.html);
}
function getResponseHeader(event, name) {
  return event.node.res.getHeader(name);
}
function setResponseHeaders(event, headers) {
  for (const [name, value] of Object.entries(headers)) {
    event.node.res.setHeader(name, value);
  }
}
const setHeaders = setResponseHeaders;
function setResponseHeader(event, name, value) {
  event.node.res.setHeader(name, value);
}
function removeResponseHeader(event, name) {
  return event.node.res.removeHeader(name);
}
function isStream(data) {
  if (!data || typeof data !== "object") {
    return false;
  }
  if (typeof data.pipe === "function") {
    if (typeof data._read === "function") {
      return true;
    }
    if (typeof data.abort === "function") {
      return true;
    }
  }
  if (typeof data.pipeTo === "function") {
    return true;
  }
  return false;
}
function isWebResponse(data) {
  return typeof Response !== "undefined" && data instanceof Response;
}
function sendStream(event, stream) {
  if (!stream || typeof stream !== "object") {
    throw new Error("[h3] Invalid stream provided.");
  }
  event.node.res._data = stream;
  if (!event.node.res.socket) {
    event._handled = true;
    return Promise.resolve();
  }
  if (hasProp(stream, "pipeTo") && typeof stream.pipeTo === "function") {
    return stream.pipeTo(
      new WritableStream({
        write(chunk) {
          event.node.res.write(chunk);
        }
      })
    ).then(() => {
      event.node.res.end();
    });
  }
  if (hasProp(stream, "pipe") && typeof stream.pipe === "function") {
    return new Promise((resolve, reject) => {
      stream.pipe(event.node.res);
      if (stream.on) {
        stream.on("end", () => {
          event.node.res.end();
          resolve();
        });
        stream.on("error", (error) => {
          reject(error);
        });
      }
      event.node.res.on("close", () => {
        if (stream.abort) {
          stream.abort();
        }
      });
    });
  }
  throw new Error("[h3] Invalid or incompatible stream provided.");
}
function sendWebResponse(event, response) {
  for (const [key, value] of response.headers) {
    if (key === "set-cookie") {
      event.node.res.appendHeader(key, splitCookiesString(value));
    } else {
      event.node.res.setHeader(key, value);
    }
  }
  if (response.status) {
    event.node.res.statusCode = sanitizeStatusCode(
      response.status,
      event.node.res.statusCode
    );
  }
  if (response.statusText) {
    event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  }
  if (response.redirected) {
    event.node.res.setHeader("location", response.url);
  }
  if (!response.body) {
    event.node.res.end();
    return;
  }
  return sendStream(event, response.body);
}

const PayloadMethods = /* @__PURE__ */ new Set(["PATCH", "POST", "PUT", "DELETE"]);
const ignoredHeaders = /* @__PURE__ */ new Set([
  "transfer-encoding",
  "connection",
  "keep-alive",
  "upgrade",
  "expect",
  "host",
  "accept"
]);
async function proxyRequest(event, target, opts = {}) {
  let body;
  let duplex;
  if (PayloadMethods.has(event.method)) {
    if (opts.streamRequest) {
      body = getRequestWebStream(event);
      duplex = "half";
    } else {
      body = await readRawBody(event, false).catch(() => void 0);
    }
  }
  const method = opts.fetchOptions?.method || event.method;
  const fetchHeaders = mergeHeaders(
    getProxyRequestHeaders(event),
    opts.fetchOptions?.headers,
    opts.headers
  );
  return sendProxy(event, target, {
    ...opts,
    fetchOptions: {
      method,
      body,
      duplex,
      ...opts.fetchOptions,
      headers: fetchHeaders
    }
  });
}
async function sendProxy(event, target, opts = {}) {
  const response = await _getFetch(opts.fetch)(target, {
    headers: opts.headers,
    ignoreResponseError: true,
    // make $ofetch.raw transparent
    ...opts.fetchOptions
  });
  event.node.res.statusCode = sanitizeStatusCode(
    response.status,
    event.node.res.statusCode
  );
  event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  const cookies = [];
  for (const [key, value] of response.headers.entries()) {
    if (key === "content-encoding") {
      continue;
    }
    if (key === "content-length") {
      continue;
    }
    if (key === "set-cookie") {
      cookies.push(...splitCookiesString(value));
      continue;
    }
    event.node.res.setHeader(key, value);
  }
  if (cookies.length > 0) {
    event.node.res.setHeader(
      "set-cookie",
      cookies.map((cookie) => {
        if (opts.cookieDomainRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookieDomainRewrite,
            "domain"
          );
        }
        if (opts.cookiePathRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookiePathRewrite,
            "path"
          );
        }
        return cookie;
      })
    );
  }
  if (opts.onResponse) {
    await opts.onResponse(event, response);
  }
  if (response._data !== void 0) {
    return response._data;
  }
  if (event.handled) {
    return;
  }
  if (opts.sendStream === false) {
    const data = new Uint8Array(await response.arrayBuffer());
    return event.node.res.end(data);
  }
  if (response.body) {
    for await (const chunk of response.body) {
      event.node.res.write(chunk);
    }
  }
  return event.node.res.end();
}
function getProxyRequestHeaders(event) {
  const headers = /* @__PURE__ */ Object.create(null);
  const reqHeaders = getRequestHeaders(event);
  for (const name in reqHeaders) {
    if (!ignoredHeaders.has(name)) {
      headers[name] = reqHeaders[name];
    }
  }
  return headers;
}
function fetchWithEvent(event, req, init, options) {
  return _getFetch(options?.fetch)(req, {
    ...init,
    context: init?.context || event.context,
    headers: {
      ...getProxyRequestHeaders(event),
      ...init?.headers
    }
  });
}
function _getFetch(_fetch) {
  if (_fetch) {
    return _fetch;
  }
  if (globalThis.fetch) {
    return globalThis.fetch;
  }
  throw new Error(
    "fetch is not available. Try importing `node-fetch-native/polyfill` for Node.js."
  );
}
function rewriteCookieProperty(header, map, property) {
  const _map = typeof map === "string" ? { "*": map } : map;
  return header.replace(
    new RegExp(`(;\\s*${property}=)([^;]+)`, "gi"),
    (match, prefix, previousValue) => {
      let newValue;
      if (previousValue in _map) {
        newValue = _map[previousValue];
      } else if ("*" in _map) {
        newValue = _map["*"];
      } else {
        return match;
      }
      return newValue ? prefix + newValue : "";
    }
  );
}
function mergeHeaders(defaults, ...inputs) {
  const _inputs = inputs.filter(Boolean);
  if (_inputs.length === 0) {
    return defaults;
  }
  const merged = new Headers(defaults);
  for (const input of _inputs) {
    for (const [key, value] of Object.entries(input)) {
      if (value !== void 0) {
        merged.set(key, value);
      }
    }
  }
  return merged;
}

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class H3Event {
  constructor(req, res) {
    __publicField(this, "__is_event__", true);
    // Context
    __publicField(this, "node");
    // Node
    __publicField(this, "web");
    // Web
    __publicField(this, "context", {});
    // Shared
    // Request
    __publicField(this, "_method");
    __publicField(this, "_path");
    __publicField(this, "_headers");
    __publicField(this, "_requestBody");
    // Response
    __publicField(this, "_handled", false);
    this.node = { req, res };
  }
  // --- Request ---
  get method() {
    if (!this._method) {
      this._method = (this.node.req.method || "GET").toUpperCase();
    }
    return this._method;
  }
  get path() {
    return this._path || this.node.req.url || "/";
  }
  get headers() {
    if (!this._headers) {
      this._headers = _normalizeNodeHeaders(this.node.req.headers);
    }
    return this._headers;
  }
  // --- Respoonse ---
  get handled() {
    return this._handled || this.node.res.writableEnded || this.node.res.headersSent;
  }
  respondWith(response) {
    return Promise.resolve(response).then(
      (_response) => sendWebResponse(this, _response)
    );
  }
  // --- Utils ---
  toString() {
    return `[${this.method}] ${this.path}`;
  }
  toJSON() {
    return this.toString();
  }
  // --- Deprecated ---
  /** @deprecated Please use `event.node.req` instead. **/
  get req() {
    return this.node.req;
  }
  /** @deprecated Please use `event.node.res` instead. **/
  get res() {
    return this.node.res;
  }
}
function isEvent(input) {
  return hasProp(input, "__is_event__");
}
function createEvent(req, res) {
  return new H3Event(req, res);
}
function _normalizeNodeHeaders(nodeHeaders) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(nodeHeaders)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(name, item);
      }
    } else if (value) {
      headers.set(name, value);
    }
  }
  return headers;
}

function defineEventHandler(handler) {
  if (typeof handler === "function") {
    handler.__is_handler__ = true;
    return handler;
  }
  const _hooks = {
    onRequest: _normalizeArray(handler.onRequest),
    onBeforeResponse: _normalizeArray(handler.onBeforeResponse)
  };
  const _handler = (event) => {
    return _callHandler(event, handler.handler, _hooks);
  };
  _handler.__is_handler__ = true;
  _handler.__resolve__ = handler.handler.__resolve__;
  _handler.__websocket__ = handler.websocket;
  return _handler;
}
function _normalizeArray(input) {
  return input ? Array.isArray(input) ? input : [input] : void 0;
}
async function _callHandler(event, handler, hooks) {
  if (hooks.onRequest) {
    for (const hook of hooks.onRequest) {
      await hook(event);
      if (event.handled) {
        return;
      }
    }
  }
  const body = await handler(event);
  const response = { body };
  if (hooks.onBeforeResponse) {
    for (const hook of hooks.onBeforeResponse) {
      await hook(event, response);
    }
  }
  return response.body;
}
const eventHandler = defineEventHandler;
function isEventHandler(input) {
  return hasProp(input, "__is_handler__");
}
function toEventHandler(input, _, _route) {
  if (!isEventHandler(input)) {
    console.warn(
      "[h3] Implicit event handler conversion is deprecated. Use `eventHandler()` or `fromNodeMiddleware()` to define event handlers.",
      _route && _route !== "/" ? `
     Route: ${_route}` : "",
      `
     Handler: ${input}`
    );
  }
  return input;
}
function defineLazyEventHandler(factory) {
  let _promise;
  let _resolved;
  const resolveHandler = () => {
    if (_resolved) {
      return Promise.resolve(_resolved);
    }
    if (!_promise) {
      _promise = Promise.resolve(factory()).then((r) => {
        const handler2 = r.default || r;
        if (typeof handler2 !== "function") {
          throw new TypeError(
            "Invalid lazy handler result. It should be a function:",
            handler2
          );
        }
        _resolved = { handler: toEventHandler(r.default || r) };
        return _resolved;
      });
    }
    return _promise;
  };
  const handler = eventHandler((event) => {
    if (_resolved) {
      return _resolved.handler(event);
    }
    return resolveHandler().then((r) => r.handler(event));
  });
  handler.__resolve__ = resolveHandler;
  return handler;
}
const lazyEventHandler = defineLazyEventHandler;

function createApp(options = {}) {
  const stack = [];
  const handler = createAppEventHandler(stack, options);
  const resolve = createResolver(stack);
  handler.__resolve__ = resolve;
  const getWebsocket = cachedFn(() => websocketOptions(resolve, options));
  const app = {
    // @ts-expect-error
    use: (arg1, arg2, arg3) => use(app, arg1, arg2, arg3),
    resolve,
    handler,
    stack,
    options,
    get websocket() {
      return getWebsocket();
    }
  };
  return app;
}
function use(app, arg1, arg2, arg3) {
  if (Array.isArray(arg1)) {
    for (const i of arg1) {
      use(app, i, arg2, arg3);
    }
  } else if (Array.isArray(arg2)) {
    for (const i of arg2) {
      use(app, arg1, i, arg3);
    }
  } else if (typeof arg1 === "string") {
    app.stack.push(
      normalizeLayer({ ...arg3, route: arg1, handler: arg2 })
    );
  } else if (typeof arg1 === "function") {
    app.stack.push(normalizeLayer({ ...arg2, handler: arg1 }));
  } else {
    app.stack.push(normalizeLayer({ ...arg1 }));
  }
  return app;
}
function createAppEventHandler(stack, options) {
  const spacing = options.debug ? 2 : void 0;
  return eventHandler(async (event) => {
    event.node.req.originalUrl = event.node.req.originalUrl || event.node.req.url || "/";
    const _reqPath = event._path || event.node.req.url || "/";
    let _layerPath;
    if (options.onRequest) {
      await options.onRequest(event);
    }
    for (const layer of stack) {
      if (layer.route.length > 1) {
        if (!_reqPath.startsWith(layer.route)) {
          continue;
        }
        _layerPath = _reqPath.slice(layer.route.length) || "/";
      } else {
        _layerPath = _reqPath;
      }
      if (layer.match && !layer.match(_layerPath, event)) {
        continue;
      }
      event._path = _layerPath;
      event.node.req.url = _layerPath;
      const val = await layer.handler(event);
      const _body = val === void 0 ? void 0 : await val;
      if (_body !== void 0) {
        const _response = { body: _body };
        if (options.onBeforeResponse) {
          await options.onBeforeResponse(event, _response);
        }
        await handleHandlerResponse(event, _response.body, spacing);
        if (options.onAfterResponse) {
          await options.onAfterResponse(event, _response);
        }
        return;
      }
      if (event.handled) {
        if (options.onAfterResponse) {
          await options.onAfterResponse(event, void 0);
        }
        return;
      }
    }
    if (!event.handled) {
      throw createError$1({
        statusCode: 404,
        statusMessage: `Cannot find any path matching ${event.path || "/"}.`
      });
    }
    if (options.onAfterResponse) {
      await options.onAfterResponse(event, void 0);
    }
  });
}
function createResolver(stack) {
  return async (path) => {
    let _layerPath;
    for (const layer of stack) {
      if (layer.route === "/" && !layer.handler.__resolve__) {
        continue;
      }
      if (!path.startsWith(layer.route)) {
        continue;
      }
      _layerPath = path.slice(layer.route.length) || "/";
      if (layer.match && !layer.match(_layerPath, void 0)) {
        continue;
      }
      let res = { route: layer.route, handler: layer.handler };
      if (res.handler.__resolve__) {
        const _res = await res.handler.__resolve__(_layerPath);
        if (!_res) {
          continue;
        }
        res = {
          ...res,
          ..._res,
          route: joinURL(res.route || "/", _res.route || "/")
        };
      }
      return res;
    }
  };
}
function normalizeLayer(input) {
  let handler = input.handler;
  if (handler.handler) {
    handler = handler.handler;
  }
  if (input.lazy) {
    handler = lazyEventHandler(handler);
  } else if (!isEventHandler(handler)) {
    handler = toEventHandler(handler, void 0, input.route);
  }
  return {
    route: withoutTrailingSlash(input.route),
    match: input.match,
    handler
  };
}
function handleHandlerResponse(event, val, jsonSpace) {
  if (val === null) {
    return sendNoContent(event);
  }
  if (val) {
    if (isWebResponse(val)) {
      return sendWebResponse(event, val);
    }
    if (isStream(val)) {
      return sendStream(event, val);
    }
    if (val.buffer) {
      return send(event, val);
    }
    if (val.arrayBuffer && typeof val.arrayBuffer === "function") {
      return val.arrayBuffer().then((arrayBuffer) => {
        return send(event, Buffer.from(arrayBuffer), val.type);
      });
    }
    if (val instanceof Error) {
      throw createError$1(val);
    }
    if (typeof val.end === "function") {
      return true;
    }
  }
  const valType = typeof val;
  if (valType === "string") {
    return send(event, val, MIMES.html);
  }
  if (valType === "object" || valType === "boolean" || valType === "number") {
    return send(event, JSON.stringify(val, void 0, jsonSpace), MIMES.json);
  }
  if (valType === "bigint") {
    return send(event, val.toString(), MIMES.json);
  }
  throw createError$1({
    statusCode: 500,
    statusMessage: `[h3] Cannot send ${valType} as response.`
  });
}
function cachedFn(fn) {
  let cache;
  return () => {
    if (!cache) {
      cache = fn();
    }
    return cache;
  };
}
function websocketOptions(evResolver, appOptions) {
  return {
    ...appOptions.websocket,
    async resolve(info) {
      const { pathname } = parseURL(info.url || "/");
      const resolved = await evResolver(pathname);
      return resolved?.handler?.__websocket__ || {};
    }
  };
}

const RouterMethods = [
  "connect",
  "delete",
  "get",
  "head",
  "options",
  "post",
  "put",
  "trace",
  "patch"
];
function createRouter(opts = {}) {
  const _router = createRouter$1({});
  const routes = {};
  let _matcher;
  const router = {};
  const addRoute = (path, handler, method) => {
    let route = routes[path];
    if (!route) {
      routes[path] = route = { path, handlers: {} };
      _router.insert(path, route);
    }
    if (Array.isArray(method)) {
      for (const m of method) {
        addRoute(path, handler, m);
      }
    } else {
      route.handlers[method] = toEventHandler(handler, void 0, path);
    }
    return router;
  };
  router.use = router.add = (path, handler, method) => addRoute(path, handler, method || "all");
  for (const method of RouterMethods) {
    router[method] = (path, handle) => router.add(path, handle, method);
  }
  const matchHandler = (path = "/", method = "get") => {
    const qIndex = path.indexOf("?");
    if (qIndex !== -1) {
      path = path.slice(0, Math.max(0, qIndex));
    }
    const matched = _router.lookup(path);
    if (!matched || !matched.handlers) {
      return {
        error: createError$1({
          statusCode: 404,
          name: "Not Found",
          statusMessage: `Cannot find any route matching ${path || "/"}.`
        })
      };
    }
    let handler = matched.handlers[method] || matched.handlers.all;
    if (!handler) {
      if (!_matcher) {
        _matcher = toRouteMatcher(_router);
      }
      const _matches = _matcher.matchAll(path).reverse();
      for (const _match of _matches) {
        if (_match.handlers[method]) {
          handler = _match.handlers[method];
          matched.handlers[method] = matched.handlers[method] || handler;
          break;
        }
        if (_match.handlers.all) {
          handler = _match.handlers.all;
          matched.handlers.all = matched.handlers.all || handler;
          break;
        }
      }
    }
    if (!handler) {
      return {
        error: createError$1({
          statusCode: 405,
          name: "Method Not Allowed",
          statusMessage: `Method ${method} is not allowed on this route.`
        })
      };
    }
    return { matched, handler };
  };
  const isPreemptive = opts.preemptive || opts.preemtive;
  router.handler = eventHandler((event) => {
    const match = matchHandler(
      event.path,
      event.method.toLowerCase()
    );
    if ("error" in match) {
      if (isPreemptive) {
        throw match.error;
      } else {
        return;
      }
    }
    event.context.matchedRoute = match.matched;
    const params = match.matched.params || {};
    event.context.params = params;
    return Promise.resolve(match.handler(event)).then((res) => {
      if (res === void 0 && isPreemptive) {
        return null;
      }
      return res;
    });
  });
  router.handler.__resolve__ = async (path) => {
    path = withLeadingSlash(path);
    const match = matchHandler(path);
    if ("error" in match) {
      return;
    }
    let res = {
      route: match.matched.path,
      handler: match.handler
    };
    if (match.handler.__resolve__) {
      const _res = await match.handler.__resolve__(path);
      if (!_res) {
        return;
      }
      res = { ...res, ..._res };
    }
    return res;
  };
  return router;
}
function toNodeListener(app) {
  const toNodeHandle = async function(req, res) {
    const event = createEvent(req, res);
    try {
      await app.handler(event);
    } catch (_error) {
      const error = createError$1(_error);
      if (!isError(_error)) {
        error.unhandled = true;
      }
      if (app.options.onError) {
        await app.options.onError(error, event);
      }
      if (event.handled) {
        return;
      }
      if (error.unhandled || error.fatal) {
        console.error("[h3]", error.fatal ? "[fatal]" : "[unhandled]", error);
      }
      await sendError(event, error, !!app.options.debug);
    }
  };
  return toNodeHandle;
}

const s=globalThis.Headers,i=globalThis.AbortController,l=globalThis.fetch||(()=>{throw new Error("[node-fetch-native] Failed to fetch: `globalThis.fetch` is not available!")});

class FetchError extends Error {
  constructor(message, opts) {
    super(message, opts);
    this.name = "FetchError";
    if (opts?.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
}
function createFetchError(ctx) {
  const errorMessage = ctx.error?.message || ctx.error?.toString() || "";
  const method = ctx.request?.method || ctx.options?.method || "GET";
  const url = ctx.request?.url || String(ctx.request) || "/";
  const requestStr = `[${method}] ${JSON.stringify(url)}`;
  const statusStr = ctx.response ? `${ctx.response.status} ${ctx.response.statusText}` : "<no response>";
  const message = `${requestStr}: ${statusStr}${errorMessage ? ` ${errorMessage}` : ""}`;
  const fetchError = new FetchError(
    message,
    ctx.error ? { cause: ctx.error } : void 0
  );
  for (const key of ["request", "options", "response"]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx[key];
      }
    });
  }
  for (const [key, refKey] of [
    ["data", "_data"],
    ["status", "status"],
    ["statusCode", "status"],
    ["statusText", "statusText"],
    ["statusMessage", "statusText"]
  ]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx.response && ctx.response[refKey];
      }
    });
  }
  return fetchError;
}

const payloadMethods = new Set(
  Object.freeze(["PATCH", "POST", "PUT", "DELETE"])
);
function isPayloadMethod(method = "GET") {
  return payloadMethods.has(method.toUpperCase());
}
function isJSONSerializable(value) {
  if (value === void 0) {
    return false;
  }
  const t = typeof value;
  if (t === "string" || t === "number" || t === "boolean" || t === null) {
    return true;
  }
  if (t !== "object") {
    return false;
  }
  if (Array.isArray(value)) {
    return true;
  }
  if (value.buffer) {
    return false;
  }
  return value.constructor && value.constructor.name === "Object" || typeof value.toJSON === "function";
}
const textTypes = /* @__PURE__ */ new Set([
  "image/svg",
  "application/xml",
  "application/xhtml",
  "application/html"
]);
const JSON_RE = /^application\/(?:[\w!#$%&*.^`~-]*\+)?json(;.+)?$/i;
function detectResponseType(_contentType = "") {
  if (!_contentType) {
    return "json";
  }
  const contentType = _contentType.split(";").shift() || "";
  if (JSON_RE.test(contentType)) {
    return "json";
  }
  if (textTypes.has(contentType) || contentType.startsWith("text/")) {
    return "text";
  }
  return "blob";
}
function mergeFetchOptions(input, defaults, Headers = globalThis.Headers) {
  const merged = {
    ...defaults,
    ...input
  };
  if (defaults?.params && input?.params) {
    merged.params = {
      ...defaults?.params,
      ...input?.params
    };
  }
  if (defaults?.query && input?.query) {
    merged.query = {
      ...defaults?.query,
      ...input?.query
    };
  }
  if (defaults?.headers && input?.headers) {
    merged.headers = new Headers(defaults?.headers || {});
    for (const [key, value] of new Headers(input?.headers || {})) {
      merged.headers.set(key, value);
    }
  }
  return merged;
}

const retryStatusCodes = /* @__PURE__ */ new Set([
  408,
  // Request Timeout
  409,
  // Conflict
  425,
  // Too Early
  429,
  // Too Many Requests
  500,
  // Internal Server Error
  502,
  // Bad Gateway
  503,
  // Service Unavailable
  504
  //  Gateway Timeout
]);
const nullBodyResponses$1 = /* @__PURE__ */ new Set([101, 204, 205, 304]);
function createFetch$1(globalOptions = {}) {
  const {
    fetch = globalThis.fetch,
    Headers = globalThis.Headers,
    AbortController = globalThis.AbortController
  } = globalOptions;
  async function onError(context) {
    const isAbort = context.error && context.error.name === "AbortError" && !context.options.timeout || false;
    if (context.options.retry !== false && !isAbort) {
      let retries;
      if (typeof context.options.retry === "number") {
        retries = context.options.retry;
      } else {
        retries = isPayloadMethod(context.options.method) ? 0 : 1;
      }
      const responseCode = context.response && context.response.status || 500;
      if (retries > 0 && (Array.isArray(context.options.retryStatusCodes) ? context.options.retryStatusCodes.includes(responseCode) : retryStatusCodes.has(responseCode))) {
        const retryDelay = context.options.retryDelay || 0;
        if (retryDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
        return $fetchRaw(context.request, {
          ...context.options,
          retry: retries - 1
        });
      }
    }
    const error = createFetchError(context);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(error, $fetchRaw);
    }
    throw error;
  }
  const $fetchRaw = async function $fetchRaw2(_request, _options = {}) {
    const context = {
      request: _request,
      options: mergeFetchOptions(_options, globalOptions.defaults, Headers),
      response: void 0,
      error: void 0
    };
    context.options.method = context.options.method?.toUpperCase();
    if (context.options.onRequest) {
      await context.options.onRequest(context);
    }
    if (typeof context.request === "string") {
      if (context.options.baseURL) {
        context.request = withBase(context.request, context.options.baseURL);
      }
      if (context.options.query || context.options.params) {
        context.request = withQuery(context.request, {
          ...context.options.params,
          ...context.options.query
        });
      }
    }
    if (context.options.body && isPayloadMethod(context.options.method)) {
      if (isJSONSerializable(context.options.body)) {
        context.options.body = typeof context.options.body === "string" ? context.options.body : JSON.stringify(context.options.body);
        context.options.headers = new Headers(context.options.headers || {});
        if (!context.options.headers.has("content-type")) {
          context.options.headers.set("content-type", "application/json");
        }
        if (!context.options.headers.has("accept")) {
          context.options.headers.set("accept", "application/json");
        }
      } else if (
        // ReadableStream Body
        "pipeTo" in context.options.body && typeof context.options.body.pipeTo === "function" || // Node.js Stream Body
        typeof context.options.body.pipe === "function"
      ) {
        if (!("duplex" in context.options)) {
          context.options.duplex = "half";
        }
      }
    }
    let abortTimeout;
    if (!context.options.signal && context.options.timeout) {
      const controller = new AbortController();
      abortTimeout = setTimeout(
        () => controller.abort(),
        context.options.timeout
      );
      context.options.signal = controller.signal;
    }
    try {
      context.response = await fetch(
        context.request,
        context.options
      );
    } catch (error) {
      context.error = error;
      if (context.options.onRequestError) {
        await context.options.onRequestError(context);
      }
      return await onError(context);
    } finally {
      if (abortTimeout) {
        clearTimeout(abortTimeout);
      }
    }
    const hasBody = context.response.body && !nullBodyResponses$1.has(context.response.status) && context.options.method !== "HEAD";
    if (hasBody) {
      const responseType = (context.options.parseResponse ? "json" : context.options.responseType) || detectResponseType(context.response.headers.get("content-type") || "");
      switch (responseType) {
        case "json": {
          const data = await context.response.text();
          const parseFunction = context.options.parseResponse || destr;
          context.response._data = parseFunction(data);
          break;
        }
        case "stream": {
          context.response._data = context.response.body;
          break;
        }
        default: {
          context.response._data = await context.response[responseType]();
        }
      }
    }
    if (context.options.onResponse) {
      await context.options.onResponse(context);
    }
    if (!context.options.ignoreResponseError && context.response.status >= 400 && context.response.status < 600) {
      if (context.options.onResponseError) {
        await context.options.onResponseError(context);
      }
      return await onError(context);
    }
    return context.response;
  };
  const $fetch = async function $fetch2(request, options) {
    const r = await $fetchRaw(request, options);
    return r._data;
  };
  $fetch.raw = $fetchRaw;
  $fetch.native = (...args) => fetch(...args);
  $fetch.create = (defaultOptions = {}) => createFetch$1({
    ...globalOptions,
    defaults: {
      ...globalOptions.defaults,
      ...defaultOptions
    }
  });
  return $fetch;
}

function createNodeFetch() {
  const useKeepAlive = JSON.parse(process.env.FETCH_KEEP_ALIVE || "false");
  if (!useKeepAlive) {
    return l;
  }
  const agentOptions = { keepAlive: true };
  const httpAgent = new http.Agent(agentOptions);
  const httpsAgent = new https.Agent(agentOptions);
  const nodeFetchOptions = {
    agent(parsedURL) {
      return parsedURL.protocol === "http:" ? httpAgent : httpsAgent;
    }
  };
  return function nodeFetchWithKeepAlive(input, init) {
    return l(input, { ...nodeFetchOptions, ...init });
  };
}
const fetch = globalThis.fetch || createNodeFetch();
const Headers$1 = globalThis.Headers || s;
const AbortController = globalThis.AbortController || i;
const ofetch = createFetch$1({ fetch, Headers: Headers$1, AbortController });
const $fetch = ofetch;

const nullBodyResponses = /* @__PURE__ */ new Set([101, 204, 205, 304]);
function createCall(handle) {
  return function callHandle(context) {
    const req = new IncomingMessage();
    const res = new ServerResponse(req);
    req.url = context.url || "/";
    req.method = context.method || "GET";
    req.headers = {};
    if (context.headers) {
      const headerEntries = typeof context.headers.entries === "function" ? context.headers.entries() : Object.entries(context.headers);
      for (const [name, value] of headerEntries) {
        if (!value) {
          continue;
        }
        req.headers[name.toLowerCase()] = value;
      }
    }
    req.headers.host = req.headers.host || context.host || "localhost";
    req.connection.encrypted = // @ts-ignore
    req.connection.encrypted || context.protocol === "https";
    req.body = context.body || null;
    req.__unenv__ = context.context;
    return handle(req, res).then(() => {
      let body = res._data;
      if (nullBodyResponses.has(res.statusCode) || req.method.toUpperCase() === "HEAD") {
        body = null;
        delete res._headers["content-length"];
      }
      const r = {
        body,
        headers: res._headers,
        status: res.statusCode,
        statusText: res.statusMessage
      };
      req.destroy();
      res.destroy();
      return r;
    });
  };
}

function createFetch(call, _fetch = global.fetch) {
  return async function ufetch(input, init) {
    const url = input.toString();
    if (!url.startsWith("/")) {
      return _fetch(url, init);
    }
    try {
      const r = await call({ url, ...init });
      return new Response(r.body, {
        status: r.status,
        statusText: r.statusText,
        headers: Object.fromEntries(
          Object.entries(r.headers).map(([name, value]) => [
            name,
            Array.isArray(value) ? value.join(",") : String(value) || ""
          ])
        )
      });
    } catch (error) {
      return new Response(error.toString(), {
        status: Number.parseInt(error.statusCode || error.code) || 500,
        statusText: error.statusText
      });
    }
  };
}

function flatHooks(configHooks, hooks = {}, parentName) {
  for (const key in configHooks) {
    const subHook = configHooks[key];
    const name = parentName ? `${parentName}:${key}` : key;
    if (typeof subHook === "object" && subHook !== null) {
      flatHooks(subHook, hooks, name);
    } else if (typeof subHook === "function") {
      hooks[name] = subHook;
    }
  }
  return hooks;
}
const defaultTask = { run: (function_) => function_() };
const _createTask = () => defaultTask;
const createTask = typeof console.createTask !== "undefined" ? console.createTask : _createTask;
function serialTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return hooks.reduce(
    (promise, hookFunction) => promise.then(() => task.run(() => hookFunction(...args))),
    Promise.resolve()
  );
}
function parallelTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return Promise.all(hooks.map((hook) => task.run(() => hook(...args))));
}
function callEachWith(callbacks, arg0) {
  for (const callback of [...callbacks]) {
    callback(arg0);
  }
}

class Hookable {
  constructor() {
    this._hooks = {};
    this._before = void 0;
    this._after = void 0;
    this._deprecatedMessages = void 0;
    this._deprecatedHooks = {};
    this.hook = this.hook.bind(this);
    this.callHook = this.callHook.bind(this);
    this.callHookWith = this.callHookWith.bind(this);
  }
  hook(name, function_, options = {}) {
    if (!name || typeof function_ !== "function") {
      return () => {
      };
    }
    const originalName = name;
    let dep;
    while (this._deprecatedHooks[name]) {
      dep = this._deprecatedHooks[name];
      name = dep.to;
    }
    if (dep && !options.allowDeprecated) {
      let message = dep.message;
      if (!message) {
        message = `${originalName} hook has been deprecated` + (dep.to ? `, please use ${dep.to}` : "");
      }
      if (!this._deprecatedMessages) {
        this._deprecatedMessages = /* @__PURE__ */ new Set();
      }
      if (!this._deprecatedMessages.has(message)) {
        console.warn(message);
        this._deprecatedMessages.add(message);
      }
    }
    if (!function_.name) {
      try {
        Object.defineProperty(function_, "name", {
          get: () => "_" + name.replace(/\W+/g, "_") + "_hook_cb",
          configurable: true
        });
      } catch {
      }
    }
    this._hooks[name] = this._hooks[name] || [];
    this._hooks[name].push(function_);
    return () => {
      if (function_) {
        this.removeHook(name, function_);
        function_ = void 0;
      }
    };
  }
  hookOnce(name, function_) {
    let _unreg;
    let _function = (...arguments_) => {
      if (typeof _unreg === "function") {
        _unreg();
      }
      _unreg = void 0;
      _function = void 0;
      return function_(...arguments_);
    };
    _unreg = this.hook(name, _function);
    return _unreg;
  }
  removeHook(name, function_) {
    if (this._hooks[name]) {
      const index = this._hooks[name].indexOf(function_);
      if (index !== -1) {
        this._hooks[name].splice(index, 1);
      }
      if (this._hooks[name].length === 0) {
        delete this._hooks[name];
      }
    }
  }
  deprecateHook(name, deprecated) {
    this._deprecatedHooks[name] = typeof deprecated === "string" ? { to: deprecated } : deprecated;
    const _hooks = this._hooks[name] || [];
    delete this._hooks[name];
    for (const hook of _hooks) {
      this.hook(name, hook);
    }
  }
  deprecateHooks(deprecatedHooks) {
    Object.assign(this._deprecatedHooks, deprecatedHooks);
    for (const name in deprecatedHooks) {
      this.deprecateHook(name, deprecatedHooks[name]);
    }
  }
  addHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    const removeFns = Object.keys(hooks).map(
      (key) => this.hook(key, hooks[key])
    );
    return () => {
      for (const unreg of removeFns.splice(0, removeFns.length)) {
        unreg();
      }
    };
  }
  removeHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    for (const key in hooks) {
      this.removeHook(key, hooks[key]);
    }
  }
  removeAllHooks() {
    for (const key in this._hooks) {
      delete this._hooks[key];
    }
  }
  callHook(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(serialTaskCaller, name, ...arguments_);
  }
  callHookParallel(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(parallelTaskCaller, name, ...arguments_);
  }
  callHookWith(caller, name, ...arguments_) {
    const event = this._before || this._after ? { name, args: arguments_, context: {} } : void 0;
    if (this._before) {
      callEachWith(this._before, event);
    }
    const result = caller(
      name in this._hooks ? [...this._hooks[name]] : [],
      arguments_
    );
    if (result instanceof Promise) {
      return result.finally(() => {
        if (this._after && event) {
          callEachWith(this._after, event);
        }
      });
    }
    if (this._after && event) {
      callEachWith(this._after, event);
    }
    return result;
  }
  beforeEach(function_) {
    this._before = this._before || [];
    this._before.push(function_);
    return () => {
      if (this._before !== void 0) {
        const index = this._before.indexOf(function_);
        if (index !== -1) {
          this._before.splice(index, 1);
        }
      }
    };
  }
  afterEach(function_) {
    this._after = this._after || [];
    this._after.push(function_);
    return () => {
      if (this._after !== void 0) {
        const index = this._after.indexOf(function_);
        if (index !== -1) {
          this._after.splice(index, 1);
        }
      }
    };
  }
}
function createHooks() {
  return new Hookable();
}

function klona(x) {
	if (typeof x !== 'object') return x;

	var k, tmp, str=Object.prototype.toString.call(x);

	if (str === '[object Object]') {
		if (x.constructor !== Object && typeof x.constructor === 'function') {
			tmp = new x.constructor();
			for (k in x) {
				if (x.hasOwnProperty(k) && tmp[k] !== x[k]) {
					tmp[k] = klona(x[k]);
				}
			}
		} else {
			tmp = {}; // null
			for (k in x) {
				if (k === '__proto__') {
					Object.defineProperty(tmp, k, {
						value: klona(x[k]),
						configurable: true,
						enumerable: true,
						writable: true,
					});
				} else {
					tmp[k] = klona(x[k]);
				}
			}
		}
		return tmp;
	}

	if (str === '[object Array]') {
		k = x.length;
		for (tmp=Array(k); k--;) {
			tmp[k] = klona(x[k]);
		}
		return tmp;
	}

	if (str === '[object Set]') {
		tmp = new Set;
		x.forEach(function (val) {
			tmp.add(klona(val));
		});
		return tmp;
	}

	if (str === '[object Map]') {
		tmp = new Map;
		x.forEach(function (val, key) {
			tmp.set(klona(key), klona(val));
		});
		return tmp;
	}

	if (str === '[object Date]') {
		return new Date(+x);
	}

	if (str === '[object RegExp]') {
		tmp = new RegExp(x.source, x.flags);
		tmp.lastIndex = x.lastIndex;
		return tmp;
	}

	if (str === '[object DataView]') {
		return new x.constructor( klona(x.buffer) );
	}

	if (str === '[object ArrayBuffer]') {
		return x.slice(0);
	}

	// ArrayBuffer.isView(x)
	// ~> `new` bcuz `Buffer.slice` => ref
	if (str.slice(-6) === 'Array]') {
		return new x.constructor(x);
	}

	return x;
}

const NUMBER_CHAR_RE = /\d/;
const STR_SPLITTERS = ["-", "_", "/", "."];
function isUppercase(char = "") {
  if (NUMBER_CHAR_RE.test(char)) {
    return void 0;
  }
  return char !== char.toLowerCase();
}
function splitByCase(str, separators) {
  const splitters = STR_SPLITTERS;
  const parts = [];
  if (!str || typeof str !== "string") {
    return parts;
  }
  let buff = "";
  let previousUpper;
  let previousSplitter;
  for (const char of str) {
    const isSplitter = splitters.includes(char);
    if (isSplitter === true) {
      parts.push(buff);
      buff = "";
      previousUpper = void 0;
      continue;
    }
    const isUpper = isUppercase(char);
    if (previousSplitter === false) {
      if (previousUpper === false && isUpper === true) {
        parts.push(buff);
        buff = char;
        previousUpper = isUpper;
        continue;
      }
      if (previousUpper === true && isUpper === false && buff.length > 1) {
        const lastChar = buff.at(-1);
        parts.push(buff.slice(0, Math.max(0, buff.length - 1)));
        buff = lastChar + char;
        previousUpper = isUpper;
        continue;
      }
    }
    buff += char;
    previousUpper = isUpper;
    previousSplitter = isSplitter;
  }
  parts.push(buff);
  return parts;
}
function kebabCase(str, joiner) {
  return str ? (Array.isArray(str) ? str : splitByCase(str)).map((p) => p.toLowerCase()).join(joiner ) : "";
}
function snakeCase(str) {
  return kebabCase(str || "", "_");
}

function getEnv(key, opts) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    process.env[opts.prefix + envKey] ?? process.env[opts.altPrefix + envKey]
  );
}
function _isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function applyEnv(obj, opts, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey, opts);
    if (_isObject(obj[key])) {
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
        applyEnv(obj[key], opts, subKey);
      } else if (envValue === void 0) {
        applyEnv(obj[key], opts, subKey);
      } else {
        obj[key] = envValue ?? obj[key];
      }
    } else {
      obj[key] = envValue ?? obj[key];
    }
    if (opts.envExpansion && typeof obj[key] === "string") {
      obj[key] = _expandFromEnv(obj[key]);
    }
  }
  return obj;
}
const envExpandRx = /{{(.*?)}}/g;
function _expandFromEnv(value) {
  return value.replace(envExpandRx, (match, key) => {
    return process.env[key] || match;
  });
}

const inlineAppConfig = {
  "nuxt": {}
};



const appConfig = defuFn(inlineAppConfig);

const _inlineRuntimeConfig = {
  "app": {
    "baseURL": "/",
    "buildId": "b187f70d-2ef1-44b4-9a8f-5c81274ae1d6",
    "buildAssetsDir": "/_nuxt/",
    "cdnURL": ""
  },
  "nitro": {
    "envPrefix": "NUXT_",
    "routeRules": {
      "/__nuxt_error": {
        "cache": false
      },
      "/_nuxt/builds/meta/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      },
      "/_nuxt/builds/**": {
        "headers": {
          "cache-control": "public, max-age=1, immutable"
        }
      },
      "/_nuxt/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      }
    }
  },
  "public": {},
  "ipx": {
    "baseURL": "/_ipx",
    "alias": {},
    "fs": {
      "dir": "../public"
    },
    "http": {
      "domains": []
    }
  }
};
const envOptions = {
  prefix: "NITRO_",
  altPrefix: _inlineRuntimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_",
  envExpansion: _inlineRuntimeConfig.nitro.envExpansion ?? process.env.NITRO_ENV_EXPANSION ?? false
};
const _sharedRuntimeConfig = _deepFreeze(
  applyEnv(klona(_inlineRuntimeConfig), envOptions)
);
function useRuntimeConfig(event) {
  if (!event) {
    return _sharedRuntimeConfig;
  }
  if (event.context.nitro.runtimeConfig) {
    return event.context.nitro.runtimeConfig;
  }
  const runtimeConfig = klona(_inlineRuntimeConfig);
  applyEnv(runtimeConfig, envOptions);
  event.context.nitro.runtimeConfig = runtimeConfig;
  return runtimeConfig;
}
_deepFreeze(klona(appConfig));
function _deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      _deepFreeze(value);
    }
  }
  return Object.freeze(object);
}
new Proxy(/* @__PURE__ */ Object.create(null), {
  get: (_, prop) => {
    console.warn(
      "Please use `useRuntimeConfig()` instead of accessing config directly."
    );
    const runtimeConfig = useRuntimeConfig();
    if (prop in runtimeConfig) {
      return runtimeConfig[prop];
    }
    return void 0;
  }
});

function wrapToPromise(value) {
  if (!value || typeof value.then !== "function") {
    return Promise.resolve(value);
  }
  return value;
}
function asyncCall(function_, ...arguments_) {
  try {
    return wrapToPromise(function_(...arguments_));
  } catch (error) {
    return Promise.reject(error);
  }
}
function isPrimitive(value) {
  const type = typeof value;
  return value === null || type !== "object" && type !== "function";
}
function isPureObject(value) {
  const proto = Object.getPrototypeOf(value);
  return !proto || proto.isPrototypeOf(Object);
}
function stringify(value) {
  if (isPrimitive(value)) {
    return String(value);
  }
  if (isPureObject(value) || Array.isArray(value)) {
    return JSON.stringify(value);
  }
  if (typeof value.toJSON === "function") {
    return stringify(value.toJSON());
  }
  throw new Error("[unstorage] Cannot stringify value!");
}
function checkBufferSupport() {
  if (typeof Buffer === void 0) {
    throw new TypeError("[unstorage] Buffer is not supported!");
  }
}
const BASE64_PREFIX = "base64:";
function serializeRaw(value) {
  if (typeof value === "string") {
    return value;
  }
  checkBufferSupport();
  const base64 = Buffer.from(value).toString("base64");
  return BASE64_PREFIX + base64;
}
function deserializeRaw(value) {
  if (typeof value !== "string") {
    return value;
  }
  if (!value.startsWith(BASE64_PREFIX)) {
    return value;
  }
  checkBufferSupport();
  return Buffer.from(value.slice(BASE64_PREFIX.length), "base64");
}

const storageKeyProperties = [
  "hasItem",
  "getItem",
  "getItemRaw",
  "setItem",
  "setItemRaw",
  "removeItem",
  "getMeta",
  "setMeta",
  "removeMeta",
  "getKeys",
  "clear",
  "mount",
  "unmount"
];
function prefixStorage(storage, base) {
  base = normalizeBaseKey(base);
  if (!base) {
    return storage;
  }
  const nsStorage = { ...storage };
  for (const property of storageKeyProperties) {
    nsStorage[property] = (key = "", ...args) => (
      // @ts-ignore
      storage[property](base + key, ...args)
    );
  }
  nsStorage.getKeys = (key = "", ...arguments_) => storage.getKeys(base + key, ...arguments_).then((keys) => keys.map((key2) => key2.slice(base.length)));
  return nsStorage;
}
function normalizeKey$1(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0].replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "");
}
function joinKeys(...keys) {
  return normalizeKey$1(keys.join(":"));
}
function normalizeBaseKey(base) {
  base = normalizeKey$1(base);
  return base ? base + ":" : "";
}

function defineDriver$1(factory) {
  return factory;
}

const DRIVER_NAME$1 = "memory";
const memory = defineDriver$1(() => {
  const data = /* @__PURE__ */ new Map();
  return {
    name: DRIVER_NAME$1,
    options: {},
    hasItem(key) {
      return data.has(key);
    },
    getItem(key) {
      return data.get(key) ?? null;
    },
    getItemRaw(key) {
      return data.get(key) ?? null;
    },
    setItem(key, value) {
      data.set(key, value);
    },
    setItemRaw(key, value) {
      data.set(key, value);
    },
    removeItem(key) {
      data.delete(key);
    },
    getKeys() {
      return Array.from(data.keys());
    },
    clear() {
      data.clear();
    },
    dispose() {
      data.clear();
    }
  };
});

function createStorage(options = {}) {
  const context = {
    mounts: { "": options.driver || memory() },
    mountpoints: [""],
    watching: false,
    watchListeners: [],
    unwatch: {}
  };
  const getMount = (key) => {
    for (const base of context.mountpoints) {
      if (key.startsWith(base)) {
        return {
          base,
          relativeKey: key.slice(base.length),
          driver: context.mounts[base]
        };
      }
    }
    return {
      base: "",
      relativeKey: key,
      driver: context.mounts[""]
    };
  };
  const getMounts = (base, includeParent) => {
    return context.mountpoints.filter(
      (mountpoint) => mountpoint.startsWith(base) || includeParent && base.startsWith(mountpoint)
    ).map((mountpoint) => ({
      relativeBase: base.length > mountpoint.length ? base.slice(mountpoint.length) : void 0,
      mountpoint,
      driver: context.mounts[mountpoint]
    }));
  };
  const onChange = (event, key) => {
    if (!context.watching) {
      return;
    }
    key = normalizeKey$1(key);
    for (const listener of context.watchListeners) {
      listener(event, key);
    }
  };
  const startWatch = async () => {
    if (context.watching) {
      return;
    }
    context.watching = true;
    for (const mountpoint in context.mounts) {
      context.unwatch[mountpoint] = await watch(
        context.mounts[mountpoint],
        onChange,
        mountpoint
      );
    }
  };
  const stopWatch = async () => {
    if (!context.watching) {
      return;
    }
    for (const mountpoint in context.unwatch) {
      await context.unwatch[mountpoint]();
    }
    context.unwatch = {};
    context.watching = false;
  };
  const runBatch = (items, commonOptions, cb) => {
    const batches = /* @__PURE__ */ new Map();
    const getBatch = (mount) => {
      let batch = batches.get(mount.base);
      if (!batch) {
        batch = {
          driver: mount.driver,
          base: mount.base,
          items: []
        };
        batches.set(mount.base, batch);
      }
      return batch;
    };
    for (const item of items) {
      const isStringItem = typeof item === "string";
      const key = normalizeKey$1(isStringItem ? item : item.key);
      const value = isStringItem ? void 0 : item.value;
      const options2 = isStringItem || !item.options ? commonOptions : { ...commonOptions, ...item.options };
      const mount = getMount(key);
      getBatch(mount).items.push({
        key,
        value,
        relativeKey: mount.relativeKey,
        options: options2
      });
    }
    return Promise.all([...batches.values()].map((batch) => cb(batch))).then(
      (r) => r.flat()
    );
  };
  const storage = {
    // Item
    hasItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.hasItem, relativeKey, opts);
    },
    getItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => destr(value)
      );
    },
    getItems(items, commonOptions) {
      return runBatch(items, commonOptions, (batch) => {
        if (batch.driver.getItems) {
          return asyncCall(
            batch.driver.getItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              options: item.options
            })),
            commonOptions
          ).then(
            (r) => r.map((item) => ({
              key: joinKeys(batch.base, item.key),
              value: destr(item.value)
            }))
          );
        }
        return Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.getItem,
              item.relativeKey,
              item.options
            ).then((value) => ({
              key: item.key,
              value: destr(value)
            }));
          })
        );
      });
    },
    getItemRaw(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.getItemRaw) {
        return asyncCall(driver.getItemRaw, relativeKey, opts);
      }
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => deserializeRaw(value)
      );
    },
    async setItem(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.setItem) {
        return;
      }
      await asyncCall(driver.setItem, relativeKey, stringify(value), opts);
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async setItems(items, commonOptions) {
      await runBatch(items, commonOptions, async (batch) => {
        if (batch.driver.setItems) {
          return asyncCall(
            batch.driver.setItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              value: stringify(item.value),
              options: item.options
            })),
            commonOptions
          );
        }
        if (!batch.driver.setItem) {
          return;
        }
        await Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.setItem,
              item.relativeKey,
              stringify(item.value),
              item.options
            );
          })
        );
      });
    },
    async setItemRaw(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key, opts);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.setItemRaw) {
        await asyncCall(driver.setItemRaw, relativeKey, value, opts);
      } else if (driver.setItem) {
        await asyncCall(driver.setItem, relativeKey, serializeRaw(value), opts);
      } else {
        return;
      }
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async removeItem(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { removeMeta: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.removeItem) {
        return;
      }
      await asyncCall(driver.removeItem, relativeKey, opts);
      if (opts.removeMeta || opts.removeMata) {
        await asyncCall(driver.removeItem, relativeKey + "$", opts);
      }
      if (!driver.watch) {
        onChange("remove", key);
      }
    },
    // Meta
    async getMeta(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { nativeOnly: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      const meta = /* @__PURE__ */ Object.create(null);
      if (driver.getMeta) {
        Object.assign(meta, await asyncCall(driver.getMeta, relativeKey, opts));
      }
      if (!opts.nativeOnly) {
        const value = await asyncCall(
          driver.getItem,
          relativeKey + "$",
          opts
        ).then((value_) => destr(value_));
        if (value && typeof value === "object") {
          if (typeof value.atime === "string") {
            value.atime = new Date(value.atime);
          }
          if (typeof value.mtime === "string") {
            value.mtime = new Date(value.mtime);
          }
          Object.assign(meta, value);
        }
      }
      return meta;
    },
    setMeta(key, value, opts = {}) {
      return this.setItem(key + "$", value, opts);
    },
    removeMeta(key, opts = {}) {
      return this.removeItem(key + "$", opts);
    },
    // Keys
    async getKeys(base, opts = {}) {
      base = normalizeBaseKey(base);
      const mounts = getMounts(base, true);
      let maskedMounts = [];
      const allKeys = [];
      for (const mount of mounts) {
        const rawKeys = await asyncCall(
          mount.driver.getKeys,
          mount.relativeBase,
          opts
        );
        const keys = rawKeys.map((key) => mount.mountpoint + normalizeKey$1(key)).filter((key) => !maskedMounts.some((p) => key.startsWith(p)));
        allKeys.push(...keys);
        maskedMounts = [
          mount.mountpoint,
          ...maskedMounts.filter((p) => !p.startsWith(mount.mountpoint))
        ];
      }
      return base ? allKeys.filter((key) => key.startsWith(base) && !key.endsWith("$")) : allKeys.filter((key) => !key.endsWith("$"));
    },
    // Utils
    async clear(base, opts = {}) {
      base = normalizeBaseKey(base);
      await Promise.all(
        getMounts(base, false).map(async (m) => {
          if (m.driver.clear) {
            return asyncCall(m.driver.clear, m.relativeBase, opts);
          }
          if (m.driver.removeItem) {
            const keys = await m.driver.getKeys(m.relativeBase || "", opts);
            return Promise.all(
              keys.map((key) => m.driver.removeItem(key, opts))
            );
          }
        })
      );
    },
    async dispose() {
      await Promise.all(
        Object.values(context.mounts).map((driver) => dispose(driver))
      );
    },
    async watch(callback) {
      await startWatch();
      context.watchListeners.push(callback);
      return async () => {
        context.watchListeners = context.watchListeners.filter(
          (listener) => listener !== callback
        );
        if (context.watchListeners.length === 0) {
          await stopWatch();
        }
      };
    },
    async unwatch() {
      context.watchListeners = [];
      await stopWatch();
    },
    // Mount
    mount(base, driver) {
      base = normalizeBaseKey(base);
      if (base && context.mounts[base]) {
        throw new Error(`already mounted at ${base}`);
      }
      if (base) {
        context.mountpoints.push(base);
        context.mountpoints.sort((a, b) => b.length - a.length);
      }
      context.mounts[base] = driver;
      if (context.watching) {
        Promise.resolve(watch(driver, onChange, base)).then((unwatcher) => {
          context.unwatch[base] = unwatcher;
        }).catch(console.error);
      }
      return storage;
    },
    async unmount(base, _dispose = true) {
      base = normalizeBaseKey(base);
      if (!base || !context.mounts[base]) {
        return;
      }
      if (context.watching && base in context.unwatch) {
        context.unwatch[base]();
        delete context.unwatch[base];
      }
      if (_dispose) {
        await dispose(context.mounts[base]);
      }
      context.mountpoints = context.mountpoints.filter((key) => key !== base);
      delete context.mounts[base];
    },
    getMount(key = "") {
      key = normalizeKey$1(key) + ":";
      const m = getMount(key);
      return {
        driver: m.driver,
        base: m.base
      };
    },
    getMounts(base = "", opts = {}) {
      base = normalizeKey$1(base);
      const mounts = getMounts(base, opts.parents);
      return mounts.map((m) => ({
        driver: m.driver,
        base: m.mountpoint
      }));
    }
  };
  return storage;
}
function watch(driver, onChange, base) {
  return driver.watch ? driver.watch((event, key) => onChange(event, base + key)) : () => {
  };
}
async function dispose(driver) {
  if (typeof driver.dispose === "function") {
    await asyncCall(driver.dispose);
  }
}

const _assets = {

};

const normalizeKey = function normalizeKey(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0].replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "");
};

const assets$1 = {
  getKeys() {
    return Promise.resolve(Object.keys(_assets))
  },
  hasItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(id in _assets)
  },
  getItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].import() : null)
  },
  getMeta (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].meta : {})
  }
};

function defineDriver(factory) {
  return factory;
}
function createError(driver, message, opts) {
  const err = new Error(`[unstorage] [${driver}] ${message}`, opts);
  return err;
}
function createRequiredError(driver, name) {
  if (Array.isArray(name)) {
    return createError(
      driver,
      `Missing some of the required options ${name.map((n) => "`" + n + "`").join(", ")}`
    );
  }
  return createError(driver, `Missing required option \`${name}\`.`);
}

function ignoreNotfound(err) {
  return err.code === "ENOENT" || err.code === "EISDIR" ? null : err;
}
function ignoreExists(err) {
  return err.code === "EEXIST" ? null : err;
}
async function writeFile(path, data, encoding) {
  await ensuredir(dirname$1(path));
  return promises.writeFile(path, data, encoding);
}
function readFile(path, encoding) {
  return promises.readFile(path, encoding).catch(ignoreNotfound);
}
function unlink(path) {
  return promises.unlink(path).catch(ignoreNotfound);
}
function readdir(dir) {
  return promises.readdir(dir, { withFileTypes: true }).catch(ignoreNotfound).then((r) => r || []);
}
async function ensuredir(dir) {
  if (existsSync(dir)) {
    return;
  }
  await ensuredir(dirname$1(dir)).catch(ignoreExists);
  await promises.mkdir(dir).catch(ignoreExists);
}
async function readdirRecursive(dir, ignore) {
  if (ignore && ignore(dir)) {
    return [];
  }
  const entries = await readdir(dir);
  const files = [];
  await Promise.all(
    entries.map(async (entry) => {
      const entryPath = resolve$1(dir, entry.name);
      if (entry.isDirectory()) {
        const dirFiles = await readdirRecursive(entryPath, ignore);
        files.push(...dirFiles.map((f) => entry.name + "/" + f));
      } else {
        if (!(ignore && ignore(entry.name))) {
          files.push(entry.name);
        }
      }
    })
  );
  return files;
}
async function rmRecursive(dir) {
  const entries = await readdir(dir);
  await Promise.all(
    entries.map((entry) => {
      const entryPath = resolve$1(dir, entry.name);
      if (entry.isDirectory()) {
        return rmRecursive(entryPath).then(() => promises.rmdir(entryPath));
      } else {
        return promises.unlink(entryPath);
      }
    })
  );
}

const PATH_TRAVERSE_RE = /\.\.\:|\.\.$/;
const DRIVER_NAME = "fs-lite";
const unstorage_47drivers_47fs_45lite = defineDriver((opts = {}) => {
  if (!opts.base) {
    throw createRequiredError(DRIVER_NAME, "base");
  }
  opts.base = resolve$1(opts.base);
  const r = (key) => {
    if (PATH_TRAVERSE_RE.test(key)) {
      throw createError(
        DRIVER_NAME,
        `Invalid key: ${JSON.stringify(key)}. It should not contain .. segments`
      );
    }
    const resolved = join(opts.base, key.replace(/:/g, "/"));
    return resolved;
  };
  return {
    name: DRIVER_NAME,
    options: opts,
    hasItem(key) {
      return existsSync(r(key));
    },
    getItem(key) {
      return readFile(r(key), "utf8");
    },
    getItemRaw(key) {
      return readFile(r(key));
    },
    async getMeta(key) {
      const { atime, mtime, size, birthtime, ctime } = await promises.stat(r(key)).catch(() => ({}));
      return { atime, mtime, size, birthtime, ctime };
    },
    setItem(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value, "utf8");
    },
    setItemRaw(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value);
    },
    removeItem(key) {
      if (opts.readOnly) {
        return;
      }
      return unlink(r(key));
    },
    getKeys() {
      return readdirRecursive(r("."), opts.ignore);
    },
    async clear() {
      if (opts.readOnly || opts.noClear) {
        return;
      }
      await rmRecursive(r("."));
    }
  };
});

const storage = createStorage({});

storage.mount('/assets', assets$1);

storage.mount('data', unstorage_47drivers_47fs_45lite({"driver":"fsLite","base":"C:\\Users\\UR-PC\\Documents\\Business\\Projects\\Nuxt\\6\\api6.app.weather\\.data\\kv"}));

function useStorage(base = "") {
  return base ? prefixStorage(storage, base) : storage;
}

const defaultCacheOptions = {
  name: "_",
  base: "/cache",
  swr: true,
  maxAge: 1
};
function defineCachedFunction(fn, opts = {}) {
  opts = { ...defaultCacheOptions, ...opts };
  const pending = {};
  const group = opts.group || "nitro/functions";
  const name = opts.name || fn.name || "_";
  const integrity = opts.integrity || hash([fn, opts]);
  const validate = opts.validate || ((entry) => entry.value !== void 0);
  async function get(key, resolver, shouldInvalidateCache, event) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    let entry = await useStorage().getItem(cacheKey) || {};
    if (typeof entry !== "object") {
      entry = {};
      const error = new Error("Malformed data read from cache.");
      console.error("[nitro] [cache]", error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }
    const ttl = (opts.maxAge ?? opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = shouldInvalidateCache || entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || validate(entry) === false;
    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (entry.value !== void 0 && (opts.staleMaxAge || 0) >= 0 && opts.swr === false) {
          entry.value = void 0;
          entry.integrity = void 0;
          entry.mtime = void 0;
          entry.expires = void 0;
        }
        pending[key] = Promise.resolve(resolver());
      }
      try {
        entry.value = await pending[key];
      } catch (error) {
        if (!isPending) {
          delete pending[key];
        }
        throw error;
      }
      if (!isPending) {
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry) !== false) {
          const promise = useStorage().setItem(cacheKey, entry).catch((error) => {
            console.error(`[nitro] [cache] Cache write error.`, error);
            useNitroApp().captureError(error, { event, tags: ["cache"] });
          });
          if (event && event.waitUntil) {
            event.waitUntil(promise);
          }
        }
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (entry.value === void 0) {
      await _resolvePromise;
    } else if (expired && event && event.waitUntil) {
      event.waitUntil(_resolvePromise);
    }
    if (opts.swr && validate(entry) !== false) {
      _resolvePromise.catch((error) => {
        console.error(`[nitro] [cache] SWR handler error.`, error);
        useNitroApp().captureError(error, { event, tags: ["cache"] });
      });
      return entry;
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const shouldBypassCache = await opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = await opts.shouldInvalidateCache?.(...args);
    const entry = await get(
      key,
      () => fn(...args),
      shouldInvalidateCache,
      args[0] && isEvent(args[0]) ? args[0] : void 0
    );
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
const cachedFunction = defineCachedFunction;
function getKey(...args) {
  return args.length > 0 ? hash(args, {}) : "";
}
function escapeKey(key) {
  return String(key).replace(/\W/g, "");
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions) {
  const variableHeaderNames = (opts.varies || []).filter(Boolean).map((h) => h.toLowerCase()).sort();
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const customKey = await opts.getKey?.(event);
      if (customKey) {
        return escapeKey(customKey);
      }
      const _path = event.node.req.originalUrl || event.node.req.url || event.path;
      const _pathname = escapeKey(decodeURI(parseURL(_path).pathname)).slice(0, 16) || "index";
      const _hashedPath = `${_pathname}.${hash(_path)}`;
      const _headers = variableHeaderNames.map((header) => [header, event.node.req.headers[header]]).map(([name, value]) => `${escapeKey(name)}.${hash(value)}`);
      return [_hashedPath, ..._headers].join(":");
    },
    validate: (entry) => {
      if (!entry.value) {
        return false;
      }
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      if (entry.value.headers.etag === "undefined" || entry.value.headers["last-modified"] === "undefined") {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: opts.integrity || hash([handler, opts])
  };
  const _cachedHandler = cachedFunction(
    async (incomingEvent) => {
      const variableHeaders = {};
      for (const header of variableHeaderNames) {
        variableHeaders[header] = incomingEvent.node.req.headers[header];
      }
      const reqProxy = cloneWithProxy(incomingEvent.node.req, {
        headers: variableHeaders
      });
      const resHeaders = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
        statusCode: 200,
        writableEnded: false,
        writableFinished: false,
        headersSent: false,
        closed: false,
        getHeader(name) {
          return resHeaders[name];
        },
        setHeader(name, value) {
          resHeaders[name] = value;
          return this;
        },
        getHeaderNames() {
          return Object.keys(resHeaders);
        },
        hasHeader(name) {
          return name in resHeaders;
        },
        removeHeader(name) {
          delete resHeaders[name];
        },
        getHeaders() {
          return resHeaders;
        },
        end(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        writeHead(statusCode, headers2) {
          this.statusCode = statusCode;
          if (headers2) {
            for (const header in headers2) {
              this.setHeader(header, headers2[header]);
            }
          }
          return this;
        }
      });
      const event = createEvent(reqProxy, resProxy);
      event.fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: useNitroApp().localFetch
      });
      event.$fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: globalThis.$fetch
      });
      event.context = incomingEvent.context;
      const body = await handler(event) || _resSendBody;
      const headers = event.node.res.getHeaders();
      headers.etag = String(
        headers.Etag || headers.etag || `W/"${hash(body)}"`
      );
      headers["last-modified"] = String(
        headers["Last-Modified"] || headers["last-modified"] || (/* @__PURE__ */ new Date()).toUTCString()
      );
      const cacheControl = [];
      if (opts.swr) {
        if (opts.maxAge) {
          cacheControl.push(`s-maxage=${opts.maxAge}`);
        }
        if (opts.staleMaxAge) {
          cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
        } else {
          cacheControl.push("stale-while-revalidate");
        }
      } else if (opts.maxAge) {
        cacheControl.push(`max-age=${opts.maxAge}`);
      }
      if (cacheControl.length > 0) {
        headers["cache-control"] = cacheControl.join(", ");
      }
      const cacheEntry = {
        code: event.node.res.statusCode,
        headers,
        body
      };
      return cacheEntry;
    },
    _opts
  );
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(event);
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      const value = response.headers[name];
      if (name === "set-cookie") {
        event.node.res.appendHeader(
          name,
          splitCookiesString(value)
        );
      } else {
        event.node.res.setHeader(name, value);
      }
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

function hasReqHeader(event, name, includes) {
  const value = getRequestHeader(event, name);
  return value && typeof value === "string" && value.toLowerCase().includes(includes);
}
function isJsonRequest(event) {
  if (hasReqHeader(event, "accept", "text/html")) {
    return false;
  }
  return hasReqHeader(event, "accept", "application/json") || hasReqHeader(event, "user-agent", "curl/") || hasReqHeader(event, "user-agent", "httpie/") || hasReqHeader(event, "sec-fetch-mode", "cors") || event.path.startsWith("/api/") || event.path.endsWith(".json");
}
function normalizeError(error) {
  const cwd = typeof process.cwd === "function" ? process.cwd() : "/";
  const stack = (error.stack || "").split("\n").splice(1).filter((line) => line.includes("at ")).map((line) => {
    const text = line.replace(cwd + "/", "./").replace("webpack:/", "").replace("file://", "").trim();
    return {
      text,
      internal: line.includes("node_modules") && !line.includes(".cache") || line.includes("internal") || line.includes("new Promise")
    };
  });
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage ?? (statusCode === 404 ? "Not Found" : "");
  const message = error.message || error.toString();
  return {
    stack,
    statusCode,
    statusMessage,
    message
  };
}
function _captureError(error, type) {
  console.error(`[nitro] [${type}]`, error);
  useNitroApp().captureError(error, { tags: [type] });
}
function trapUnhandledNodeErrors() {
  process.on(
    "unhandledRejection",
    (error) => _captureError(error, "unhandledRejection")
  );
  process.on(
    "uncaughtException",
    (error) => _captureError(error, "uncaughtException")
  );
}
function joinHeaders(value) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}
function normalizeFetchResponse(response) {
  if (!response.headers.has("set-cookie")) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: normalizeCookieHeaders(response.headers)
  });
}
function normalizeCookieHeader(header = "") {
  return splitCookiesString(joinHeaders(header));
}
function normalizeCookieHeaders(headers) {
  const outgoingHeaders = new Headers();
  for (const [name, header] of headers) {
    if (name === "set-cookie") {
      for (const cookie of normalizeCookieHeader(header)) {
        outgoingHeaders.append("set-cookie", cookie);
      }
    } else {
      outgoingHeaders.set(name, joinHeaders(header));
    }
  }
  return outgoingHeaders;
}

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter$1({ routes: config.nitro.routeRules })
);
function createRouteRulesHandler(ctx) {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      let target = routeRules.redirect.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.redirect._redirectStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery$1(event.path);
        target = withQuery(target, query);
      }
      return sendRedirect(event, target, routeRules.redirect.statusCode);
    }
    if (routeRules.proxy) {
      let target = routeRules.proxy.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.proxy._proxyStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery$1(event.path);
        target = withQuery(target, query);
      }
      return proxyRequest(event, target, {
        fetch: ctx.localFetch,
        ...routeRules.proxy
      });
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split("?")[0], useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

const plugins = [
  
];

const errorHandler = (async function errorhandler(error, event) {
  const { stack, statusCode, statusMessage, message } = normalizeError(error);
  const errorObject = {
    url: event.path,
    statusCode,
    statusMessage,
    message,
    stack: "",
    // TODO: check and validate error.data for serialisation into query
    data: error.data
  };
  if (error.unhandled || error.fatal) {
    const tags = [
      "[nuxt]",
      "[request error]",
      error.unhandled && "[unhandled]",
      error.fatal && "[fatal]",
      Number(errorObject.statusCode) !== 200 && `[${errorObject.statusCode}]`
    ].filter(Boolean).join(" ");
    console.error(tags, errorObject.message + "\n" + stack.map((l) => "  " + l.text).join("  \n"));
  }
  if (event.handled) {
    return;
  }
  setResponseStatus(event, errorObject.statusCode !== 200 && errorObject.statusCode || 500, errorObject.statusMessage);
  if (isJsonRequest(event)) {
    setResponseHeader(event, "Content-Type", "application/json");
    return send(event, JSON.stringify(errorObject));
  }
  const reqHeaders = getRequestHeaders(event);
  const isRenderingError = event.path.startsWith("/__nuxt_error") || !!reqHeaders["x-nuxt-error"];
  const res = isRenderingError ? null : await useNitroApp().localFetch(
    withQuery(joinURL(useRuntimeConfig(event).app.baseURL, "/__nuxt_error"), errorObject),
    {
      headers: { ...reqHeaders, "x-nuxt-error": "true" },
      redirect: "manual"
    }
  ).catch(() => null);
  if (!res) {
    const { template } = await import('./_/error-500.mjs');
    if (event.handled) {
      return;
    }
    setResponseHeader(event, "Content-Type", "text/html;charset=UTF-8");
    return send(event, template(errorObject));
  }
  const html = await res.text();
  if (event.handled) {
    return;
  }
  for (const [header, value] of res.headers.entries()) {
    setResponseHeader(event, header, value);
  }
  setResponseStatus(event, res.status && res.status !== 200 ? res.status : void 0, res.statusText);
  return send(event, html);
});

const assets = {
  "/favicon.svg": {
    "type": "image/svg+xml",
    "etag": "\"1181-rekzJQAJ5qcmtpuyoPpDu7QuumE\"",
    "mtime": "2024-06-20T11:41:32.051Z",
    "size": 4481,
    "path": "../public/favicon.svg"
  },
  "/manifest.webmanifest": {
    "type": "application/manifest+json",
    "etag": "\"12a-LSToC1s1jTrFcth+9kswhilzaRo\"",
    "mtime": "2024-06-20T14:36:31.933Z",
    "size": 298,
    "path": "../public/manifest.webmanifest"
  },
  "/sw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4c6-QnnGDgkC2m1rRb7M0yfd2yVhH2o\"",
    "mtime": "2024-06-20T14:36:43.748Z",
    "size": 1222,
    "path": "../public/sw.js"
  },
  "/workbox-55fed457.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3faa-cX5UTR3K8fSBv5HXpDnnzb7LkEc\"",
    "mtime": "2024-06-20T14:36:43.749Z",
    "size": 16298,
    "path": "../public/workbox-55fed457.js"
  },
  "/_nuxt/BCEQI42q.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2051-QlXRCCRPqJprqFOSDskgrebmpwY\"",
    "mtime": "2024-06-20T14:36:31.911Z",
    "size": 8273,
    "path": "../public/_nuxt/BCEQI42q.js"
  },
  "/_nuxt/bVEZJi0A.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"180-egbcFITaX3UECYWJ/oWEzLMVk8U\"",
    "mtime": "2024-06-20T14:36:31.910Z",
    "size": 384,
    "path": "../public/_nuxt/bVEZJi0A.js"
  },
  "/_nuxt/BvtPLOlH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4f91-N0wKcIVxSzJeJ4pStBiDFDrwub0\"",
    "mtime": "2024-06-20T14:36:31.910Z",
    "size": 20369,
    "path": "../public/_nuxt/BvtPLOlH.js"
  },
  "/_nuxt/D5gOYdM7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1658-6Afb2z0/CA/ZN3FBqA1AjV1yc50\"",
    "mtime": "2024-06-20T14:36:31.910Z",
    "size": 5720,
    "path": "../public/_nuxt/D5gOYdM7.js"
  },
  "/_nuxt/default.V-LuVZjV.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1776-CTc3ct/iiwxsmJyjXNCKcorIre4\"",
    "mtime": "2024-06-20T14:36:31.910Z",
    "size": 6006,
    "path": "../public/_nuxt/default.V-LuVZjV.css"
  },
  "/_nuxt/DlAUqK2U.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5b-eFCz/UrraTh721pgAl0VxBNR1es\"",
    "mtime": "2024-06-20T14:36:31.909Z",
    "size": 91,
    "path": "../public/_nuxt/DlAUqK2U.js"
  },
  "/_nuxt/DOg8TnKo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ae9-HLC6hFDB4SSuUoSUfj8rS6eeN4w\"",
    "mtime": "2024-06-20T14:36:31.910Z",
    "size": 2793,
    "path": "../public/_nuxt/DOg8TnKo.js"
  },
  "/_nuxt/error-404.CjGVuf6H.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"de4-SLOwa5sHvQIi2t5fYZEgfDusMUc\"",
    "mtime": "2024-06-20T14:36:31.909Z",
    "size": 3556,
    "path": "../public/_nuxt/error-404.CjGVuf6H.css"
  },
  "/_nuxt/error-500.DFBAsgKS.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"75c-I8wgoT19gdl/gPtizNKXfkn+TtQ\"",
    "mtime": "2024-06-20T14:36:31.909Z",
    "size": 1884,
    "path": "../public/_nuxt/error-500.DFBAsgKS.css"
  },
  "/_nuxt/index.DKY5ZWP3.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"d682-tNK3c8wd+7+lwORlqEB2EQnF4rk\"",
    "mtime": "2024-06-20T14:36:31.909Z",
    "size": 54914,
    "path": "../public/_nuxt/index.DKY5ZWP3.css"
  },
  "/_nuxt/qluR96KL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"359e3-umQtWQxCff+eVZY8wQgYlKmA60E\"",
    "mtime": "2024-06-20T14:36:31.911Z",
    "size": 219619,
    "path": "../public/_nuxt/qluR96KL.js"
  },
  "/_nuxt/VTabsWindowItem.DcdDLd_I.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"52eb-BoLTttPdjr2guzGw54F+VGyWQLU\"",
    "mtime": "2024-06-20T14:36:31.910Z",
    "size": 21227,
    "path": "../public/_nuxt/VTabsWindowItem.DcdDLd_I.css"
  },
  "/_nuxt/ZVb6C6u3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b2cd-zFldGukqCnsfie93axiLciy5cGQ\"",
    "mtime": "2024-06-20T14:36:31.911Z",
    "size": 45773,
    "path": "../public/_nuxt/ZVb6C6u3.js"
  },
  "/_nuxt/_ksop30H.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16904-3bB7BqQnFo8UEogCqQ+GKEHpU1U\"",
    "mtime": "2024-06-20T14:36:31.910Z",
    "size": 92420,
    "path": "../public/_nuxt/_ksop30H.js"
  },
  "/flags/ad.svg": {
    "type": "image/svg+xml",
    "etag": "\"dfdc-0zXRFp7AK3zq8S7pT2OwAXDWUes\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 57308,
    "path": "../public/flags/ad.svg"
  },
  "/flags/ae.svg": {
    "type": "image/svg+xml",
    "etag": "\"e0-1ysqExh7g9V8HyAciOwBnrrUtYI\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 224,
    "path": "../public/flags/ae.svg"
  },
  "/flags/af.svg": {
    "type": "image/svg+xml",
    "etag": "\"36335-FRZZQ5Kkz1rqLTbIv7/FQBSkuvU\"",
    "mtime": "2024-01-03T11:02:50.000Z",
    "size": 222005,
    "path": "../public/flags/af.svg"
  },
  "/flags/ag.svg": {
    "type": "image/svg+xml",
    "etag": "\"1e3-aRqP4A0JL75ol65EoOIMJk8jJsU\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 483,
    "path": "../public/flags/ag.svg"
  },
  "/flags/ai.svg": {
    "type": "image/svg+xml",
    "etag": "\"e6e-uqgURkrfD4MN0W9SYmUj72+qcNA\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 3694,
    "path": "../public/flags/ai.svg"
  },
  "/flags/al.svg": {
    "type": "image/svg+xml",
    "etag": "\"24d1-wS6cGPk0IDwYHTfBrI8y2f9OIHY\"",
    "mtime": "2024-01-03T11:02:51.000Z",
    "size": 9425,
    "path": "../public/flags/al.svg"
  },
  "/flags/am.svg": {
    "type": "image/svg+xml",
    "etag": "\"c9-K6bBlu1ARxne5yQWIaU/yJWya6I\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 201,
    "path": "../public/flags/am.svg"
  },
  "/flags/ao.svg": {
    "type": "image/svg+xml",
    "etag": "\"8b1-xfRN1ySxNJmrQG2ld9cKd8kRM7o\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 2225,
    "path": "../public/flags/ao.svg"
  },
  "/flags/aq.svg": {
    "type": "image/svg+xml",
    "etag": "\"11a7-HfWoKEYUC3rq3hpjB+riOimKu3g\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 4519,
    "path": "../public/flags/aq.svg"
  },
  "/flags/ar.svg": {
    "type": "image/svg+xml",
    "etag": "\"fa3-g8xJUBMHhkRyo//vvV1trtTB8PE\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 4003,
    "path": "../public/flags/ar.svg"
  },
  "/flags/as.svg": {
    "type": "image/svg+xml",
    "etag": "\"bafc-xlz/zy15JGAacsQRQJ1hidX9ZPs\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 47868,
    "path": "../public/flags/as.svg"
  },
  "/flags/at.svg": {
    "type": "image/svg+xml",
    "etag": "\"9a-KrWq0NVTOXFNMMcjdZBV7s5bT+I\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 154,
    "path": "../public/flags/at.svg"
  },
  "/flags/au.svg": {
    "type": "image/svg+xml",
    "etag": "\"51b-wtNts3R0HRONFTKJmKqEyHYzvME\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 1307,
    "path": "../public/flags/au.svg"
  },
  "/flags/aw.svg": {
    "type": "image/svg+xml",
    "etag": "\"155-J8WCCr7fFiWrGyxV7NGsVFnL0ew\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 341,
    "path": "../public/flags/aw.svg"
  },
  "/flags/ax.svg": {
    "type": "image/svg+xml",
    "etag": "\"100-GR77gRhMvp5ap9t+0UwpVnsTf38\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 256,
    "path": "../public/flags/ax.svg"
  },
  "/flags/az.svg": {
    "type": "image/svg+xml",
    "etag": "\"207-+d2LA2i1HPPL7oMM+1dD0pFQnFk\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 519,
    "path": "../public/flags/az.svg"
  },
  "/flags/ba.svg": {
    "type": "image/svg+xml",
    "etag": "\"1b5-HEOiR4uXuynqEpC7Y35Y0nleNb8\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 437,
    "path": "../public/flags/ba.svg"
  },
  "/flags/bb.svg": {
    "type": "image/svg+xml",
    "etag": "\"25e-fkWs1cos/NcEHGRfNmsgYl94OLk\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 606,
    "path": "../public/flags/bb.svg"
  },
  "/flags/bd.svg": {
    "type": "image/svg+xml",
    "etag": "\"a5-J4E/mBO59PLo0Z+W3O7tWbRr16c\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 165,
    "path": "../public/flags/bd.svg"
  },
  "/flags/be.svg": {
    "type": "image/svg+xml",
    "etag": "\"b6-5yxKOQdcSBbebRuH3OL916O+OYo\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 182,
    "path": "../public/flags/be.svg"
  },
  "/flags/bf.svg": {
    "type": "image/svg+xml",
    "etag": "\"d7-jPl+rSBCDcF/Aey1vEAK0W+MbCk\"",
    "mtime": "2024-01-03T11:02:51.000Z",
    "size": 215,
    "path": "../public/flags/bf.svg"
  },
  "/flags/bg.svg": {
    "type": "image/svg+xml",
    "etag": "\"c9-wC9IvFxlk1sRo8oU6wsuuaYtvrA\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 201,
    "path": "../public/flags/bg.svg"
  },
  "/flags/bh.svg": {
    "type": "image/svg+xml",
    "etag": "\"da-7FFwGhrSuyAarcBvFl6TT0Xct0c\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 218,
    "path": "../public/flags/bh.svg"
  },
  "/flags/bi.svg": {
    "type": "image/svg+xml",
    "etag": "\"279-9sZOp5t8yAqpQl/MYoka4cLy/qE\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 633,
    "path": "../public/flags/bi.svg"
  },
  "/flags/bj.svg": {
    "type": "image/svg+xml",
    "etag": "\"c5-H3b/ySfiKKJO8wvBcCYpIDdBvXM\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 197,
    "path": "../public/flags/bj.svg"
  },
  "/flags/bl.svg": {
    "type": "image/svg+xml",
    "etag": "\"9199-JHRW1SRMfS0PGkLwdEawxk1uTHs\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 37273,
    "path": "../public/flags/bl.svg"
  },
  "/flags/bm.svg": {
    "type": "image/svg+xml",
    "etag": "\"7d8f-wDBNm/CEdMmZ5swYTQCLi2GLI7U\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 32143,
    "path": "../public/flags/bm.svg"
  },
  "/flags/bn.svg": {
    "type": "image/svg+xml",
    "etag": "\"51ba-W+xk5DwHwgQjrm1si7PB5OxVYmI\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 20922,
    "path": "../public/flags/bn.svg"
  },
  "/flags/bo.svg": {
    "type": "image/svg+xml",
    "etag": "\"3ab01-AsR7KAlTz5DU5f6eNHbRkWVvdKQ\"",
    "mtime": "2024-01-03T11:02:51.000Z",
    "size": 240385,
    "path": "../public/flags/bo.svg"
  },
  "/flags/bq.svg": {
    "type": "image/svg+xml",
    "etag": "\"1ce-eGNbenBBSawY5JZY0gAsYCNdsA8\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 462,
    "path": "../public/flags/bq.svg"
  },
  "/flags/br.svg": {
    "type": "image/svg+xml",
    "etag": "\"15f2-pFVYtdrp6Cb09KSDZKlxJW3WXAM\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 5618,
    "path": "../public/flags/br.svg"
  },
  "/flags/bs.svg": {
    "type": "image/svg+xml",
    "etag": "\"c3-95LxFfAQVdlb7SCrfS42mddhEPo\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 195,
    "path": "../public/flags/bs.svg"
  },
  "/flags/bt.svg": {
    "type": "image/svg+xml",
    "etag": "\"8fd4-vpqJPtllkJ9bi1sSjKPcCwymQKY\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 36820,
    "path": "../public/flags/bt.svg"
  },
  "/flags/bv.svg": {
    "type": "image/svg+xml",
    "etag": "\"df-VMhRT+bDNAbFski8BgNl6RVwaAM\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 223,
    "path": "../public/flags/bv.svg"
  },
  "/flags/bw.svg": {
    "type": "image/svg+xml",
    "etag": "\"c1-3v/dJHpwdl0nUC81/ByPUdG3htg\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 193,
    "path": "../public/flags/bw.svg"
  },
  "/flags/by.svg": {
    "type": "image/svg+xml",
    "etag": "\"7a7-GdzCMRyQeOpxOf8JU86GUjAtT8E\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 1959,
    "path": "../public/flags/by.svg"
  },
  "/flags/bz.svg": {
    "type": "image/svg+xml",
    "etag": "\"13bf3-iB7yfxrkHU2apid/twEB0bF0NBo\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 80883,
    "path": "../public/flags/bz.svg"
  },
  "/flags/ca.svg": {
    "type": "image/svg+xml",
    "etag": "\"292-6AznNE5c7MhKl+8T/AbdSZ3nFj0\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 658,
    "path": "../public/flags/ca.svg"
  },
  "/flags/cc.svg": {
    "type": "image/svg+xml",
    "etag": "\"125c-fDTUO/hbo7/YpvQD6uSi5dR1DEs\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 4700,
    "path": "../public/flags/cc.svg"
  },
  "/flags/cd.svg": {
    "type": "image/svg+xml",
    "etag": "\"133-p9IRnKWnzWtgbUDAMmnzeLepN5M\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 307,
    "path": "../public/flags/cd.svg"
  },
  "/flags/cf.svg": {
    "type": "image/svg+xml",
    "etag": "\"14b-oQp9xK1zuXnrCRN1fTnDt7OnUMY\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 331,
    "path": "../public/flags/cf.svg"
  },
  "/flags/cg.svg": {
    "type": "image/svg+xml",
    "etag": "\"c7-dwtJSlNWqYiArWOaP42D+bDg6AQ\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 199,
    "path": "../public/flags/cg.svg"
  },
  "/flags/ch.svg": {
    "type": "image/svg+xml",
    "etag": "\"b7-pXPVtedmUQ0QVooTp76Cuz2yDNs\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 183,
    "path": "../public/flags/ch.svg"
  },
  "/flags/ci.svg": {
    "type": "image/svg+xml",
    "etag": "\"c2-WPZ7YX/J4eZwXnUfDSUGXXLT7XQ\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 194,
    "path": "../public/flags/ci.svg"
  },
  "/flags/ck.svg": {
    "type": "image/svg+xml",
    "etag": "\"420-DB9Dd0QuxHchsTZZdb7AAadDosc\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 1056,
    "path": "../public/flags/ck.svg"
  },
  "/flags/cl.svg": {
    "type": "image/svg+xml",
    "etag": "\"f9-L4aWC1b+QwyKYIvm0XD+d+iME8Y\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 249,
    "path": "../public/flags/cl.svg"
  },
  "/flags/cm.svg": {
    "type": "image/svg+xml",
    "etag": "\"10a-lsumUaoD+BkRB/b88YXquTzy/zk\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 266,
    "path": "../public/flags/cm.svg"
  },
  "/flags/cn.svg": {
    "type": "image/svg+xml",
    "etag": "\"219-t5oUntd905mFlwzvHWk2d+jaNBY\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 537,
    "path": "../public/flags/cn.svg"
  },
  "/flags/co.svg": {
    "type": "image/svg+xml",
    "etag": "\"c9-S8tVWfBMAGGYJSxqEy7Afp4ohhA\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 201,
    "path": "../public/flags/co.svg"
  },
  "/flags/cr.svg": {
    "type": "image/svg+xml",
    "etag": "\"f6c0-XSi8V+8BVuameXuPJhuaU7t9G8w\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 63168,
    "path": "../public/flags/cr.svg"
  },
  "/flags/cu.svg": {
    "type": "image/svg+xml",
    "etag": "\"11a-6Zl402+WegFLhTa3DITYB6HodHk\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 282,
    "path": "../public/flags/cu.svg"
  },
  "/flags/cv.svg": {
    "type": "image/svg+xml",
    "etag": "\"644-ckuVF7dZzwRM8bnexndB2FJ3j1Y\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 1604,
    "path": "../public/flags/cv.svg"
  },
  "/flags/cw.svg": {
    "type": "image/svg+xml",
    "etag": "\"254-yhdmJqzDsGQKqVcI1oSJycH3VsY\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 596,
    "path": "../public/flags/cw.svg"
  },
  "/flags/cx.svg": {
    "type": "image/svg+xml",
    "etag": "\"b93-EQXaP9B/njzCLn5BFLkbE1RmQgU\"",
    "mtime": "2024-01-03T11:02:51.000Z",
    "size": 2963,
    "path": "../public/flags/cx.svg"
  },
  "/flags/cy.svg": {
    "type": "image/svg+xml",
    "etag": "\"27ae-3/npqts3R4j9zpr5Guaymsr5Wtg\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 10158,
    "path": "../public/flags/cy.svg"
  },
  "/flags/cz.svg": {
    "type": "image/svg+xml",
    "etag": "\"d2-OsGGzcPnj7o0lHpk4JyVV8Jxyic\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 210,
    "path": "../public/flags/cz.svg"
  },
  "/flags/de.svg": {
    "type": "image/svg+xml",
    "etag": "\"ba-uezCJl05fBIRH6gZrVGJKELqyKw\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 186,
    "path": "../public/flags/de.svg"
  },
  "/flags/dj.svg": {
    "type": "image/svg+xml",
    "etag": "\"173-sexUFsxvAJQWTGs0siofxyqHy+g\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 371,
    "path": "../public/flags/dj.svg"
  },
  "/flags/dk.svg": {
    "type": "image/svg+xml",
    "etag": "\"a5-i+zcQSyryqIKBSU0KU+7rjGsXro\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 165,
    "path": "../public/flags/dk.svg"
  },
  "/flags/dm.svg": {
    "type": "image/svg+xml",
    "etag": "\"12ca-pPb7eG8+RKgpXX32Q646No2kJJ0\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 4810,
    "path": "../public/flags/dm.svg"
  },
  "/flags/do.svg": {
    "type": "image/svg+xml",
    "etag": "\"24321-SCSA5y2DZBbzQegy0zE+BZS3W8s\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 148257,
    "path": "../public/flags/do.svg"
  },
  "/flags/dz.svg": {
    "type": "image/svg+xml",
    "etag": "\"11d-sAEAkRVE83d5+IX+CU3+FC+PM24\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 285,
    "path": "../public/flags/dz.svg"
  },
  "/flags/ec.svg": {
    "type": "image/svg+xml",
    "etag": "\"34f9c-RkGFMYYjTrlnwcrWe19OujYyaoY\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 216988,
    "path": "../public/flags/ec.svg"
  },
  "/flags/ee.svg": {
    "type": "image/svg+xml",
    "etag": "\"b7-/jrrgDzSDerDK/s25L541a68pxQ\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 183,
    "path": "../public/flags/ee.svg"
  },
  "/flags/eg.svg": {
    "type": "image/svg+xml",
    "etag": "\"47af-h0ZAR03RbgKcCoBDbSl1/bM+M/c\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 18351,
    "path": "../public/flags/eg.svg"
  },
  "/flags/eh.svg": {
    "type": "image/svg+xml",
    "etag": "\"1f8-otYG9l/sTDQ7aF8/rMQghIBDbGA\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 504,
    "path": "../public/flags/eh.svg"
  },
  "/flags/er.svg": {
    "type": "image/svg+xml",
    "etag": "\"cb3-3XCqlUGZq8f4poblMqlLDNFFj/4\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 3251,
    "path": "../public/flags/er.svg"
  },
  "/flags/es.svg": {
    "type": "image/svg+xml",
    "etag": "\"c4ff-xq3nJDzvrlIMNc9Hmw5P7F++Bu0\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 50431,
    "path": "../public/flags/es.svg"
  },
  "/flags/et.svg": {
    "type": "image/svg+xml",
    "etag": "\"329-aO7BCk47KUApK8i4ZBmpjI6pmAw\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 809,
    "path": "../public/flags/et.svg"
  },
  "/flags/fi.svg": {
    "type": "image/svg+xml",
    "etag": "\"c2-AgWvW4N9IBlH6x8OnrVYZPj14bM\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 194,
    "path": "../public/flags/fi.svg"
  },
  "/flags/fj.svg": {
    "type": "image/svg+xml",
    "etag": "\"9cb9-i4TidIcXvknTCqcRhBm80vi7/2w\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 40121,
    "path": "../public/flags/fj.svg"
  },
  "/flags/fk.svg": {
    "type": "image/svg+xml",
    "etag": "\"1fe8c-2Ji1ljmzFEuxVCVFrWSERoDPkXQ\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 130700,
    "path": "../public/flags/fk.svg"
  },
  "/flags/fm.svg": {
    "type": "image/svg+xml",
    "etag": "\"2ae-usuIhAwte0MHqwJwdCUQG51J9ak\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 686,
    "path": "../public/flags/fm.svg"
  },
  "/flags/fo.svg": {
    "type": "image/svg+xml",
    "etag": "\"10d-fndC8qkYQxWQgdDqmfZPqly1bvE\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 269,
    "path": "../public/flags/fo.svg"
  },
  "/flags/fr.svg": {
    "type": "image/svg+xml",
    "etag": "\"c2-A5pzBVdzrDqnC7/dslBaL7Rarho\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 194,
    "path": "../public/flags/fr.svg"
  },
  "/flags/ga.svg": {
    "type": "image/svg+xml",
    "etag": "\"c9-wvKkX/iFlGpRBNZ3wFtLajp5CdM\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 201,
    "path": "../public/flags/ga.svg"
  },
  "/flags/gb-eng.svg": {
    "type": "image/svg+xml",
    "etag": "\"b0-TYyNAACbpJilC7MnG4PNgOx2Gaw\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 176,
    "path": "../public/flags/gb-eng.svg"
  },
  "/flags/gb-nir.svg": {
    "type": "image/svg+xml",
    "etag": "\"d715-ybHaIj+IDRNurkZ5LMMJFlcJxjk\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 55061,
    "path": "../public/flags/gb-nir.svg"
  },
  "/flags/gb-sct.svg": {
    "type": "image/svg+xml",
    "etag": "\"c0-BBqEjVURhvmUleZt7gE6g+Kl3WA\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 192,
    "path": "../public/flags/gb-sct.svg"
  },
  "/flags/gb-wls.svg": {
    "type": "image/svg+xml",
    "etag": "\"3d66-haI37f80DEQv7DPthx39L9VqpXI\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 15718,
    "path": "../public/flags/gb-wls.svg"
  },
  "/flags/gb.svg": {
    "type": "image/svg+xml",
    "etag": "\"229-5sL/lIeQ5dmq/TUw5JFxYoJIzw8\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 553,
    "path": "../public/flags/gb.svg"
  },
  "/flags/gd.svg": {
    "type": "image/svg+xml",
    "etag": "\"44d-tY9uRYOEcKAAOPRRim0kPQc5pvY\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 1101,
    "path": "../public/flags/gd.svg"
  },
  "/flags/ge.svg": {
    "type": "image/svg+xml",
    "etag": "\"1e1-6gkL0UY491hjMI62Vfutlm4UhCU\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 481,
    "path": "../public/flags/ge.svg"
  },
  "/flags/gf.svg": {
    "type": "image/svg+xml",
    "etag": "\"f3-cDbcLNEGs6RATIDPiu0Vfj1m20o\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 243,
    "path": "../public/flags/gf.svg"
  },
  "/flags/gg.svg": {
    "type": "image/svg+xml",
    "etag": "\"11c-ARg240D8nEIDiqjiyGml5vQKR18\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 284,
    "path": "../public/flags/gg.svg"
  },
  "/flags/gh.svg": {
    "type": "image/svg+xml",
    "etag": "\"103-XkQjnlaj+KOreJXEDZDyjqAz/FY\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 259,
    "path": "../public/flags/gh.svg"
  },
  "/flags/gi.svg": {
    "type": "image/svg+xml",
    "etag": "\"fa4-EZV2xl1uwmHvz0Kql6w0ev/vSTA\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 4004,
    "path": "../public/flags/gi.svg"
  },
  "/flags/gl.svg": {
    "type": "image/svg+xml",
    "etag": "\"c7-2xUcQKv+4Z8pAtRFdryxV0qTzaY\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 199,
    "path": "../public/flags/gl.svg"
  },
  "/flags/gm.svg": {
    "type": "image/svg+xml",
    "etag": "\"f6-vHwAAxygyoRjWA4zMDMudYnsSwE\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 246,
    "path": "../public/flags/gm.svg"
  },
  "/flags/gn.svg": {
    "type": "image/svg+xml",
    "etag": "\"cd-+HUkX//cT1HJVJdkVQk7l+K1PnI\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 205,
    "path": "../public/flags/gn.svg"
  },
  "/flags/gp.svg": {
    "type": "image/svg+xml",
    "etag": "\"32ee-Pz3/1PKYPn+Wb5Hq8dqTbGGLfZY\"",
    "mtime": "2024-01-03T11:02:51.000Z",
    "size": 13038,
    "path": "../public/flags/gp.svg"
  },
  "/flags/gq.svg": {
    "type": "image/svg+xml",
    "etag": "\"161a-l0D3nkA+x93TWnyOa8EQBSsGK8E\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 5658,
    "path": "../public/flags/gq.svg"
  },
  "/flags/gr.svg": {
    "type": "image/svg+xml",
    "etag": "\"e7-uT/k3zEdlirduom6n/FkjKc3Enc\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 231,
    "path": "../public/flags/gr.svg"
  },
  "/flags/gs.svg": {
    "type": "image/svg+xml",
    "etag": "\"cbfd-9ETCYPzh8qRHxJlzM3E9AgYMTvE\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 52221,
    "path": "../public/flags/gs.svg"
  },
  "/flags/gt.svg": {
    "type": "image/svg+xml",
    "etag": "\"d8eb-1E8NERG/McbWaIKQ9mfClrEzpk8\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 55531,
    "path": "../public/flags/gt.svg"
  },
  "/flags/gu.svg": {
    "type": "image/svg+xml",
    "etag": "\"296e-FrCYmWHOsiTmwfhBqbpp3HSCW4c\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 10606,
    "path": "../public/flags/gu.svg"
  },
  "/flags/gw.svg": {
    "type": "image/svg+xml",
    "etag": "\"247-bqFK0+LGpeL3bN9An5dYP0qn1+E\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 583,
    "path": "../public/flags/gw.svg"
  },
  "/flags/gy.svg": {
    "type": "image/svg+xml",
    "etag": "\"1bf-un6tKHi5GzNg+3TZn1z0VGI16vI\"",
    "mtime": "2024-01-03T11:02:51.000Z",
    "size": 447,
    "path": "../public/flags/gy.svg"
  },
  "/flags/hk.svg": {
    "type": "image/svg+xml",
    "etag": "\"2b1-c9ckUMj1YqGAfa/ukZhf+xHWhzo\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 689,
    "path": "../public/flags/hk.svg"
  },
  "/flags/hm.svg": {
    "type": "image/svg+xml",
    "etag": "\"513-ng5A9y6czmWxQ8SuHmWn6UIHgvs\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 1299,
    "path": "../public/flags/hm.svg"
  },
  "/flags/hn.svg": {
    "type": "image/svg+xml",
    "etag": "\"191-YRuWv1M06XXdDuqXztCaZ4C5RSU\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 401,
    "path": "../public/flags/hn.svg"
  },
  "/flags/hr.svg": {
    "type": "image/svg+xml",
    "etag": "\"13e43-voQPWxdczZ5ZctzVz1gPJjtCm2w\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 81475,
    "path": "../public/flags/hr.svg"
  },
  "/flags/ht.svg": {
    "type": "image/svg+xml",
    "etag": "\"dd54-YdtyTGxfjOuA7mzT8p34ZxdviN4\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 56660,
    "path": "../public/flags/ht.svg"
  },
  "/flags/hu.svg": {
    "type": "image/svg+xml",
    "etag": "\"c3-PD7cEi1ijSzp0eslxMTxRzRKiAY\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 195,
    "path": "../public/flags/hu.svg"
  },
  "/flags/id.svg": {
    "type": "image/svg+xml",
    "etag": "\"94-fb7kszcfQadLj6pI47jcbjIc0+Y\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 148,
    "path": "../public/flags/id.svg"
  },
  "/flags/ie.svg": {
    "type": "image/svg+xml",
    "etag": "\"cc-rVrrHBZA7q5p4dNgEgSMPmjHu1o\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 204,
    "path": "../public/flags/ie.svg"
  },
  "/flags/il.svg": {
    "type": "image/svg+xml",
    "etag": "\"135-2Gil7lDOTFnVIn841S8FVh6OjsI\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 309,
    "path": "../public/flags/il.svg"
  },
  "/flags/im.svg": {
    "type": "image/svg+xml",
    "etag": "\"13ac-roIcKA4wYAQJPaCr16SH0pjF1Fo\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 5036,
    "path": "../public/flags/im.svg"
  },
  "/flags/in.svg": {
    "type": "image/svg+xml",
    "etag": "\"2d0-2mvW6aqoqa6hiGWChRbQhVLnj+A\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 720,
    "path": "../public/flags/in.svg"
  },
  "/flags/io.svg": {
    "type": "image/svg+xml",
    "etag": "\"14732-SJbpUfl6xoh/v32Kfml8GO3Pk8M\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 83762,
    "path": "../public/flags/io.svg"
  },
  "/flags/iq.svg": {
    "type": "image/svg+xml",
    "etag": "\"48d-OfmSmZgBmm5wPSptJIN4v6QsQB4\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 1165,
    "path": "../public/flags/iq.svg"
  },
  "/flags/ir.svg": {
    "type": "image/svg+xml",
    "etag": "\"448-Xu2qaMOlNHJ/QG5PXQvhT3hvQQw\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 1096,
    "path": "../public/flags/ir.svg"
  },
  "/flags/is.svg": {
    "type": "image/svg+xml",
    "etag": "\"f9-X43BuGcecHHUbhjGjjE3S5+zQ4I\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 249,
    "path": "../public/flags/is.svg"
  },
  "/flags/it.svg": {
    "type": "image/svg+xml",
    "etag": "\"ca-B7Ny6meWUqDB0Lj3fu2TrLdctRI\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 202,
    "path": "../public/flags/it.svg"
  },
  "/flags/je.svg": {
    "type": "image/svg+xml",
    "etag": "\"12b3e-bRSUpR2IG1cAwnAV6cIOdR5owYM\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 76606,
    "path": "../public/flags/je.svg"
  },
  "/flags/jm.svg": {
    "type": "image/svg+xml",
    "etag": "\"103-9GJKB8Aw6spSI7WuUulYFJqooiA\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 259,
    "path": "../public/flags/jm.svg"
  },
  "/flags/jo.svg": {
    "type": "image/svg+xml",
    "etag": "\"173-giRuKhKFedpDrCc7u6pYvukGsCs\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 371,
    "path": "../public/flags/jo.svg"
  },
  "/flags/jp.svg": {
    "type": "image/svg+xml",
    "etag": "\"a0-pFsXkzcuemtl+Cy2flX80dZ6l0U\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 160,
    "path": "../public/flags/jp.svg"
  },
  "/flags/ke.svg": {
    "type": "image/svg+xml",
    "etag": "\"3e9-NfbhSOl4UcrM6nyjFvDa+Fo8jRo\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 1001,
    "path": "../public/flags/ke.svg"
  },
  "/flags/kg.svg": {
    "type": "image/svg+xml",
    "etag": "\"2574-T3mWmBHwSKmwbQxUxM2ypYeTttI\"",
    "mtime": "2024-01-03T11:02:51.000Z",
    "size": 9588,
    "path": "../public/flags/kg.svg"
  },
  "/flags/kh.svg": {
    "type": "image/svg+xml",
    "etag": "\"2740-H80PeyGCILbsgxUpfjZuvU0PcJM\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 10048,
    "path": "../public/flags/kh.svg"
  },
  "/flags/ki.svg": {
    "type": "image/svg+xml",
    "etag": "\"122e-uxf/TBZ/W5tQf0tDCx1rzyBlUyU\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 4654,
    "path": "../public/flags/ki.svg"
  },
  "/flags/km.svg": {
    "type": "image/svg+xml",
    "etag": "\"22e-ZukMEziZU20PJhoFYuPVuS+mwoc\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 558,
    "path": "../public/flags/km.svg"
  },
  "/flags/kn.svg": {
    "type": "image/svg+xml",
    "etag": "\"21b-NDVAhwem+FqdIWl1xtGSLPQggo0\"",
    "mtime": "2024-01-03T11:02:51.000Z",
    "size": 539,
    "path": "../public/flags/kn.svg"
  },
  "/flags/kp.svg": {
    "type": "image/svg+xml",
    "etag": "\"297-6TTBH4N0jiJCs2FlRHC3AnULkEg\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 663,
    "path": "../public/flags/kp.svg"
  },
  "/flags/kr.svg": {
    "type": "image/svg+xml",
    "etag": "\"25f-FpjNxejw6pDXMacmBd5hinj5ccQ\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 607,
    "path": "../public/flags/kr.svg"
  },
  "/flags/kw.svg": {
    "type": "image/svg+xml",
    "etag": "\"e8-Mlj98PdxZYVlj4pcVmONAjr2hIQ\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 232,
    "path": "../public/flags/kw.svg"
  },
  "/flags/ky.svg": {
    "type": "image/svg+xml",
    "etag": "\"8938-Cza2QeOqMvyCLH8f8JRTz55zIc4\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 35128,
    "path": "../public/flags/ky.svg"
  },
  "/flags/kz.svg": {
    "type": "image/svg+xml",
    "etag": "\"25a4-JIQqhxYz1tTy0kTl7Hg0kEiq02o\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 9636,
    "path": "../public/flags/kz.svg"
  },
  "/flags/la.svg": {
    "type": "image/svg+xml",
    "etag": "\"e9-TlifmOPhpProSG9lfhz5ei7EsuE\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 233,
    "path": "../public/flags/la.svg"
  },
  "/flags/lb.svg": {
    "type": "image/svg+xml",
    "etag": "\"177d-KsyS8psobGrwx9JisWdD6pcr2sk\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 6013,
    "path": "../public/flags/lb.svg"
  },
  "/flags/lc.svg": {
    "type": "image/svg+xml",
    "etag": "\"fe-G3PWBVzdCJYhFMlUqdRn4mN5US8\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 254,
    "path": "../public/flags/lc.svg"
  },
  "/flags/li.svg": {
    "type": "image/svg+xml",
    "etag": "\"3078-bUdoa4BX/5oov/ZsBakSGyOmhDY\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 12408,
    "path": "../public/flags/li.svg"
  },
  "/flags/lk.svg": {
    "type": "image/svg+xml",
    "etag": "\"4b28-eFA2ipaqEVJnTOsGemUk+Y1muJA\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 19240,
    "path": "../public/flags/lk.svg"
  },
  "/flags/lr.svg": {
    "type": "image/svg+xml",
    "etag": "\"2a3-8nTI7eMH1xWRClhDAvB4AZxkWkY\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 675,
    "path": "../public/flags/lr.svg"
  },
  "/flags/ls.svg": {
    "type": "image/svg+xml",
    "etag": "\"5a2-zeOSWiIA8oSd99cU5i0UAdirrsw\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 1442,
    "path": "../public/flags/ls.svg"
  },
  "/flags/lt.svg": {
    "type": "image/svg+xml",
    "etag": "\"c9-uGLB79eqMWaQPxBUk1QbfmDx56U\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 201,
    "path": "../public/flags/lt.svg"
  },
  "/flags/lu.svg": {
    "type": "image/svg+xml",
    "etag": "\"ca-xWQKNi5c1SYs4k6dq6IIU/viE1g\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 202,
    "path": "../public/flags/lu.svg"
  },
  "/flags/lv.svg": {
    "type": "image/svg+xml",
    "etag": "\"9b-lznAYK+iU3A+3edON9DTXS6eak8\"",
    "mtime": "2024-01-03T11:02:51.000Z",
    "size": 155,
    "path": "../public/flags/lv.svg"
  },
  "/flags/ly.svg": {
    "type": "image/svg+xml",
    "etag": "\"161-HeiGAfOzuH1PO22J3N4Wb77qzm4\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 353,
    "path": "../public/flags/ly.svg"
  },
  "/flags/ma.svg": {
    "type": "image/svg+xml",
    "etag": "\"102-n+j1ka8ExW2zcveNZjEX7RaGuI8\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 258,
    "path": "../public/flags/ma.svg"
  },
  "/flags/mc.svg": {
    "type": "image/svg+xml",
    "etag": "\"9b-A25kpWgxR7kiXAgw5lrc2wYuu/c\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 155,
    "path": "../public/flags/mc.svg"
  },
  "/flags/md.svg": {
    "type": "image/svg+xml",
    "etag": "\"84b7-xYI0DoFu7lLm8S05Krc28pKDp9I\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 33975,
    "path": "../public/flags/md.svg"
  },
  "/flags/me.svg": {
    "type": "image/svg+xml",
    "etag": "\"1af84-9znWf4BqPcLbbcHNjhWh/C8V4S0\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 110468,
    "path": "../public/flags/me.svg"
  },
  "/flags/mf.svg": {
    "type": "image/svg+xml",
    "etag": "\"c2-A5pzBVdzrDqnC7/dslBaL7Rarho\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 194,
    "path": "../public/flags/mf.svg"
  },
  "/flags/mg.svg": {
    "type": "image/svg+xml",
    "etag": "\"c2-TfHVWev1nTro4j/6rSY7vRatEw8\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 194,
    "path": "../public/flags/mg.svg"
  },
  "/flags/mh.svg": {
    "type": "image/svg+xml",
    "etag": "\"31c-LGKsOOtU8y49bxYqcL7b1CdYtgw\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 796,
    "path": "../public/flags/mh.svg"
  },
  "/flags/mk.svg": {
    "type": "image/svg+xml",
    "etag": "\"16e-H9lyDPRPImrAIoiwj3BplwAHcuU\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 366,
    "path": "../public/flags/mk.svg"
  },
  "/flags/ml.svg": {
    "type": "image/svg+xml",
    "etag": "\"c5-5o1Ys4D1GbiSrLGR/Yn0BZd/CHs\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 197,
    "path": "../public/flags/ml.svg"
  },
  "/flags/mm.svg": {
    "type": "image/svg+xml",
    "etag": "\"21b-9qi2YqfrPelGnvTYGy2RUPbq9nM\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 539,
    "path": "../public/flags/mm.svg"
  },
  "/flags/mn.svg": {
    "type": "image/svg+xml",
    "etag": "\"5d8-IEw3CrR/otsnOR6R3OtQXcTl3Zo\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 1496,
    "path": "../public/flags/mn.svg"
  },
  "/flags/mo.svg": {
    "type": "image/svg+xml",
    "etag": "\"8d9-Kx3hgxgU8lDotbwvJ5Pz4aJCT/4\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 2265,
    "path": "../public/flags/mo.svg"
  },
  "/flags/mp.svg": {
    "type": "image/svg+xml",
    "etag": "\"28357-mpcisb9Giy07PvGYoMsZBFwJ8Sk\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 164695,
    "path": "../public/flags/mp.svg"
  },
  "/flags/mq.svg": {
    "type": "image/svg+xml",
    "etag": "\"c9-S2tmNSyZUWfwkv/26muZy6adbms\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 201,
    "path": "../public/flags/mq.svg"
  },
  "/flags/mr.svg": {
    "type": "image/svg+xml",
    "etag": "\"14d-CgldfOauYc/AZKk19mSNa9hnV6c\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 333,
    "path": "../public/flags/mr.svg"
  },
  "/flags/ms.svg": {
    "type": "image/svg+xml",
    "etag": "\"2337-aWcKkSfhOacopuDlEyWfW/CeV8U\"",
    "mtime": "2024-01-03T11:02:52.000Z",
    "size": 9015,
    "path": "../public/flags/ms.svg"
  },
  "/flags/mt.svg": {
    "type": "image/svg+xml",
    "etag": "\"3bb4-ZuCLVZRbScgc3xaYgG0CxzrIuH4\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 15284,
    "path": "../public/flags/mt.svg"
  },
  "/flags/mu.svg": {
    "type": "image/svg+xml",
    "etag": "\"ef-kp2H0h/XL+6lg3mRM1poX9dVh/s\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 239,
    "path": "../public/flags/mu.svg"
  },
  "/flags/mv.svg": {
    "type": "image/svg+xml",
    "etag": "\"f8-4zvROtq2jKfr166fuXZtCKhBfq8\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 248,
    "path": "../public/flags/mv.svg"
  },
  "/flags/mw.svg": {
    "type": "image/svg+xml",
    "etag": "\"313-2HcWIwLMEQdBvaEXpPthMFxh8Kg\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 787,
    "path": "../public/flags/mw.svg"
  },
  "/flags/mx.svg": {
    "type": "image/svg+xml",
    "etag": "\"2205f-O/SF4NmWrGhCFkt/n8twSmqSulA\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 139359,
    "path": "../public/flags/mx.svg"
  },
  "/flags/my.svg": {
    "type": "image/svg+xml",
    "etag": "\"296-s4aL+H71CiVEp6jmktOdmxbfbDQ\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 662,
    "path": "../public/flags/my.svg"
  },
  "/flags/mz.svg": {
    "type": "image/svg+xml",
    "etag": "\"ac5-n/pfQ98i2kC7WSppAoRP4aEMYEg\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 2757,
    "path": "../public/flags/mz.svg"
  },
  "/flags/na.svg": {
    "type": "image/svg+xml",
    "etag": "\"2d8-gzWclSQinzMI0Yy7d1APBJ4Q9mM\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 728,
    "path": "../public/flags/na.svg"
  },
  "/flags/nc.svg": {
    "type": "image/svg+xml",
    "etag": "\"50e-VEmfsHmPo+xkj7N/XpaBKsE/tIE\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 1294,
    "path": "../public/flags/nc.svg"
  },
  "/flags/ne.svg": {
    "type": "image/svg+xml",
    "etag": "\"f3-qXHBVyZzVyVHpKP+p0e1zW95OM8\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 243,
    "path": "../public/flags/ne.svg"
  },
  "/flags/nf.svg": {
    "type": "image/svg+xml",
    "etag": "\"3d45-IxFj2Oq4UlULhWB/6AEOfGEnruw\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 15685,
    "path": "../public/flags/nf.svg"
  },
  "/flags/ng.svg": {
    "type": "image/svg+xml",
    "etag": "\"a3-xJgkT4+Y3m6QNLnrjWzzYwG1Q6A\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 163,
    "path": "../public/flags/ng.svg"
  },
  "/flags/ni.svg": {
    "type": "image/svg+xml",
    "etag": "\"5d56-s7M8Muqf+cFdccG4/8AHY8GH3vM\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 23894,
    "path": "../public/flags/ni.svg"
  },
  "/flags/nl.svg": {
    "type": "image/svg+xml",
    "etag": "\"c8-C1WK77wdM8zpxgqDkqurkaL13i0\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 200,
    "path": "../public/flags/nl.svg"
  },
  "/flags/no.svg": {
    "type": "image/svg+xml",
    "etag": "\"df-VMhRT+bDNAbFski8BgNl6RVwaAM\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 223,
    "path": "../public/flags/no.svg"
  },
  "/flags/np.svg": {
    "type": "image/svg+xml",
    "etag": "\"41c-E4CZG6jJ8xM7Soe66oFVZSyIMyo\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 1052,
    "path": "../public/flags/np.svg"
  },
  "/flags/nr.svg": {
    "type": "image/svg+xml",
    "etag": "\"221-hg+LeuwTPnn0FxIJu8RxJ0yKFao\"",
    "mtime": "2024-01-03T11:02:52.000Z",
    "size": 545,
    "path": "../public/flags/nr.svg"
  },
  "/flags/nu.svg": {
    "type": "image/svg+xml",
    "etag": "\"3ff-WbTDmxfU0v1moYwTIQdp3ROA78c\"",
    "mtime": "2024-01-03T09:22:55.000Z",
    "size": 1023,
    "path": "../public/flags/nu.svg"
  },
  "/flags/nz.svg": {
    "type": "image/svg+xml",
    "etag": "\"6d2-iREGekQRPI5RpJlgkYc69OiZv+w\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 1746,
    "path": "../public/flags/nz.svg"
  },
  "/flags/om.svg": {
    "type": "image/svg+xml",
    "etag": "\"40ae-PqotSeBLaP5py7oGn4WOd1fnngQ\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 16558,
    "path": "../public/flags/om.svg"
  },
  "/flags/pa.svg": {
    "type": "image/svg+xml",
    "etag": "\"118-qElescufDQ7S1Rt4G35NYaHR8jA\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 280,
    "path": "../public/flags/pa.svg"
  },
  "/flags/pe.svg": {
    "type": "image/svg+xml",
    "etag": "\"9c-l5SeQIFvH0Yekwn8aHX3BlDqrB0\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 156,
    "path": "../public/flags/pe.svg"
  },
  "/flags/pf.svg": {
    "type": "image/svg+xml",
    "etag": "\"16c2-LIPQ6RNx4/smEXJNEOLYVCEotcc\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 5826,
    "path": "../public/flags/pf.svg"
  },
  "/flags/pg.svg": {
    "type": "image/svg+xml",
    "etag": "\"b99-jHzVXpNN9bbuKdiBicVhRhD+c8o\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 2969,
    "path": "../public/flags/pg.svg"
  },
  "/flags/ph.svg": {
    "type": "image/svg+xml",
    "etag": "\"328-+eSmJTuCI9me+2mqLG7IP3b+Uv4\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 808,
    "path": "../public/flags/ph.svg"
  },
  "/flags/pk.svg": {
    "type": "image/svg+xml",
    "etag": "\"17c-qa+nhoDo/TeqT7yV9+IA2uEjuEY\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 380,
    "path": "../public/flags/pk.svg"
  },
  "/flags/pl.svg": {
    "type": "image/svg+xml",
    "etag": "\"a4-sW8E0FKJkbRly3cnwGoIdxD7whA\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 164,
    "path": "../public/flags/pl.svg"
  },
  "/flags/pm.svg": {
    "type": "image/svg+xml",
    "etag": "\"14621-f3QC8O3eRi9u2cw4Ddf5KRWyZaQ\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 83489,
    "path": "../public/flags/pm.svg"
  },
  "/flags/pn.svg": {
    "type": "image/svg+xml",
    "etag": "\"3a47-Qtn9g18uAAHx126LI+2ZBmRrp/0\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 14919,
    "path": "../public/flags/pn.svg"
  },
  "/flags/pr.svg": {
    "type": "image/svg+xml",
    "etag": "\"10d-A0wZY4k3KcWSCjnmEbEG55J50LU\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 269,
    "path": "../public/flags/pr.svg"
  },
  "/flags/ps.svg": {
    "type": "image/svg+xml",
    "etag": "\"e4-9vtF2Z1oBg/Un4DdZK9ZFFfDkv0\"",
    "mtime": "2024-01-03T11:02:52.000Z",
    "size": 228,
    "path": "../public/flags/ps.svg"
  },
  "/flags/pt.svg": {
    "type": "image/svg+xml",
    "etag": "\"2bb6-gTuRxQuqnDmKfIM/Gp+ExNi3rzY\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 11190,
    "path": "../public/flags/pt.svg"
  },
  "/flags/pw.svg": {
    "type": "image/svg+xml",
    "etag": "\"9d-5/v5i8mQCqNhElXk34EO9tx9AVw\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 157,
    "path": "../public/flags/pw.svg"
  },
  "/flags/py.svg": {
    "type": "image/svg+xml",
    "etag": "\"5bcc-08gWi4tzUzLKbsdjAN8aXjh/JdE\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 23500,
    "path": "../public/flags/py.svg"
  },
  "/flags/qa.svg": {
    "type": "image/svg+xml",
    "etag": "\"fd-UFIRrxaezgf51qyMV4kLyPcsuEM\"",
    "mtime": "2024-01-03T11:02:52.000Z",
    "size": 253,
    "path": "../public/flags/qa.svg"
  },
  "/flags/re.svg": {
    "type": "image/svg+xml",
    "etag": "\"118-UdUZza2s4cd9/tzaB8arzeX/ieQ\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 280,
    "path": "../public/flags/re.svg"
  },
  "/flags/ro.svg": {
    "type": "image/svg+xml",
    "etag": "\"cb-9I60fgmAj+pm54ykqSwi8myovbc\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 203,
    "path": "../public/flags/ro.svg"
  },
  "/flags/rs.svg": {
    "type": "image/svg+xml",
    "etag": "\"70bb-5G36XsOTXQQPnxehLvHLpTrHCbc\"",
    "mtime": "2024-01-03T11:02:52.000Z",
    "size": 28859,
    "path": "../public/flags/rs.svg"
  },
  "/flags/ru.svg": {
    "type": "image/svg+xml",
    "etag": "\"c8-gtWvZ9X6I+/RJNiiSUH3zGFZB9Q\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 200,
    "path": "../public/flags/ru.svg"
  },
  "/flags/rw.svg": {
    "type": "image/svg+xml",
    "etag": "\"37e-swbDpnj/pEMT9Hos6NS+CCL++EM\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 894,
    "path": "../public/flags/rw.svg"
  },
  "/flags/sa.svg": {
    "type": "image/svg+xml",
    "etag": "\"6025-OVh54G06LK2Y9N9GDp+PQzWPy/U\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 24613,
    "path": "../public/flags/sa.svg"
  },
  "/flags/sb.svg": {
    "type": "image/svg+xml",
    "etag": "\"3a7-+gpEp3XDP47ZLpzAp3xNtqi8X4Q\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 935,
    "path": "../public/flags/sb.svg"
  },
  "/flags/sc.svg": {
    "type": "image/svg+xml",
    "etag": "\"111-I1mWkLSWxUHJZPxL+JgF5CeDvcE\"",
    "mtime": "2024-01-03T11:02:52.000Z",
    "size": 273,
    "path": "../public/flags/sc.svg"
  },
  "/flags/sd.svg": {
    "type": "image/svg+xml",
    "etag": "\"e5-EQx1RiNmC2CbWpmdzJLNiIXAP+k\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 229,
    "path": "../public/flags/sd.svg"
  },
  "/flags/se.svg": {
    "type": "image/svg+xml",
    "etag": "\"a0-bHBFtBmzdC3BZONfqviZ3IN05uU\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 160,
    "path": "../public/flags/se.svg"
  },
  "/flags/sg.svg": {
    "type": "image/svg+xml",
    "etag": "\"226-UjNmJsikY9xn5ecdsvhEe8mmuVw\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 550,
    "path": "../public/flags/sg.svg"
  },
  "/flags/sh.svg": {
    "type": "image/svg+xml",
    "etag": "\"12106-vyyLmFyMZEQEyu2N7bGUhsD/jzA\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 73990,
    "path": "../public/flags/sh.svg"
  },
  "/flags/si.svg": {
    "type": "image/svg+xml",
    "etag": "\"529-ZTQ8mACsJib78cPeqhJhanOc2HY\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 1321,
    "path": "../public/flags/si.svg"
  },
  "/flags/sj.svg": {
    "type": "image/svg+xml",
    "etag": "\"df-VMhRT+bDNAbFski8BgNl6RVwaAM\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 223,
    "path": "../public/flags/sj.svg"
  },
  "/flags/sk.svg": {
    "type": "image/svg+xml",
    "etag": "\"402-BUcMuPHp69r5wvWEaP9CPZ/rifA\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 1026,
    "path": "../public/flags/sk.svg"
  },
  "/flags/sl.svg": {
    "type": "image/svg+xml",
    "etag": "\"c2-a7E4CA6agsjMHLh8w/YykKN+HL4\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 194,
    "path": "../public/flags/sl.svg"
  },
  "/flags/sm.svg": {
    "type": "image/svg+xml",
    "etag": "\"17505-S1b2UAu8zOeyicveZtJ3yI+Wxm4\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 95493,
    "path": "../public/flags/sm.svg"
  },
  "/flags/sn.svg": {
    "type": "image/svg+xml",
    "etag": "\"e4-YZ4qybES9gG1uBB9SXMr44LIPqc\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 228,
    "path": "../public/flags/sn.svg"
  },
  "/flags/so.svg": {
    "type": "image/svg+xml",
    "etag": "\"208-O6lY1R3OW1ZIS2+nOX78wF/z8mk\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 520,
    "path": "../public/flags/so.svg"
  },
  "/flags/sr.svg": {
    "type": "image/svg+xml",
    "etag": "\"133-R3OXZT0pl/Wd+CdjPeyAMjueOes\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 307,
    "path": "../public/flags/sr.svg"
  },
  "/flags/ss.svg": {
    "type": "image/svg+xml",
    "etag": "\"19b-LQIQeyZZjDDVpwG5+c3KJEZD5Uc\"",
    "mtime": "2024-01-03T11:02:52.000Z",
    "size": 411,
    "path": "../public/flags/ss.svg"
  },
  "/flags/st.svg": {
    "type": "image/svg+xml",
    "etag": "\"163-aU2tktoVGhwue63tZenLTI60AeY\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 355,
    "path": "../public/flags/st.svg"
  },
  "/flags/sv.svg": {
    "type": "image/svg+xml",
    "etag": "\"3cc69-QcYfRibXjuYdDTB46E/PLFxN87c\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 248937,
    "path": "../public/flags/sv.svg"
  },
  "/flags/sx.svg": {
    "type": "image/svg+xml",
    "etag": "\"49f9-eg3+r8qVtbBKSdmAufBBfWncE4E\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 18937,
    "path": "../public/flags/sx.svg"
  },
  "/flags/sy.svg": {
    "type": "image/svg+xml",
    "etag": "\"137-MgTQReyQuynM/CDGnMsURoUMNTY\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 311,
    "path": "../public/flags/sy.svg"
  },
  "/flags/sz.svg": {
    "type": "image/svg+xml",
    "etag": "\"1be0-FPQSaIYUlblIOkcPFAP/B4GPwdA\"",
    "mtime": "2024-01-03T11:02:52.000Z",
    "size": 7136,
    "path": "../public/flags/sz.svg"
  },
  "/flags/tc.svg": {
    "type": "image/svg+xml",
    "etag": "\"18a6-7bznnvIpnncHHwRcY9T2Yo9uL2w\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 6310,
    "path": "../public/flags/tc.svg"
  },
  "/flags/td.svg": {
    "type": "image/svg+xml",
    "etag": "\"c5-IoqBzprbGNpaHUQ+teOXmhagE/I\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 197,
    "path": "../public/flags/td.svg"
  },
  "/flags/tf.svg": {
    "type": "image/svg+xml",
    "etag": "\"306-CDm7+NjS3ijt8iYUR1SrABrl96s\"",
    "mtime": "2024-01-03T11:02:52.000Z",
    "size": 774,
    "path": "../public/flags/tf.svg"
  },
  "/flags/tg.svg": {
    "type": "image/svg+xml",
    "etag": "\"26c-4RUWH1c555ELVDwIxRU069H1IvM\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 620,
    "path": "../public/flags/tg.svg"
  },
  "/flags/th.svg": {
    "type": "image/svg+xml",
    "etag": "\"c9-QSNnBUe4YtbW5Z0HJPFF58aW6G0\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 201,
    "path": "../public/flags/th.svg"
  },
  "/flags/tj.svg": {
    "type": "image/svg+xml",
    "etag": "\"6e4-1dbknRUI/HZjkEcKqoRSIunzhyo\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 1764,
    "path": "../public/flags/tj.svg"
  },
  "/flags/tk.svg": {
    "type": "image/svg+xml",
    "etag": "\"4b7-AethuoRvTuknXRSWkMZl/ko7sM8\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 1207,
    "path": "../public/flags/tk.svg"
  },
  "/flags/tl.svg": {
    "type": "image/svg+xml",
    "etag": "\"117-0ROCCltzeNQnkypKbUdH1TBvQJw\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 279,
    "path": "../public/flags/tl.svg"
  },
  "/flags/tm.svg": {
    "type": "image/svg+xml",
    "etag": "\"a9c1-KMkoz8HnROpUA1LrjC6OUDxfV+I\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 43457,
    "path": "../public/flags/tm.svg"
  },
  "/flags/tn.svg": {
    "type": "image/svg+xml",
    "etag": "\"116-MwZKs3QGSY5kMLnX3p9gWX+JAnU\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 278,
    "path": "../public/flags/tn.svg"
  },
  "/flags/to.svg": {
    "type": "image/svg+xml",
    "etag": "\"e3-5NXSsEhxjpMpUvON6DLuIUDkPBA\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 227,
    "path": "../public/flags/to.svg"
  },
  "/flags/tr.svg": {
    "type": "image/svg+xml",
    "etag": "\"11f-Y/A/d/kYCDBUs4+Qx3GydwqMFwA\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 287,
    "path": "../public/flags/tr.svg"
  },
  "/flags/tt.svg": {
    "type": "image/svg+xml",
    "etag": "\"e1-ffJNOBlBfYsuDmKCcxcFHO0UXsM\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 225,
    "path": "../public/flags/tt.svg"
  },
  "/flags/tv.svg": {
    "type": "image/svg+xml",
    "etag": "\"460-Wrcxp5Mt7fEUp6TZsYE8iFghCHE\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 1120,
    "path": "../public/flags/tv.svg"
  },
  "/flags/tw.svg": {
    "type": "image/svg+xml",
    "etag": "\"1e4-XipLaoxf40+i1fPcgek8KnWb8gg\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 484,
    "path": "../public/flags/tw.svg"
  },
  "/flags/tz.svg": {
    "type": "image/svg+xml",
    "etag": "\"17f-5JveZOaU4R6kvot6sZDUHol39I8\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 383,
    "path": "../public/flags/tz.svg"
  },
  "/flags/ua.svg": {
    "type": "image/svg+xml",
    "etag": "\"a0-l/2L6P6g7UrWsXpnV9qWtD+YHco\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 160,
    "path": "../public/flags/ua.svg"
  },
  "/flags/ug.svg": {
    "type": "image/svg+xml",
    "etag": "\"e20-d+LWqRJP24dheO+VF1b4ot67RUU\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 3616,
    "path": "../public/flags/ug.svg"
  },
  "/flags/um.svg": {
    "type": "image/svg+xml",
    "etag": "\"2ff-br4ekzxnWXHKLlTFjazNdNnFdyE\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 767,
    "path": "../public/flags/um.svg"
  },
  "/flags/us.svg": {
    "type": "image/svg+xml",
    "etag": "\"2ff-br4ekzxnWXHKLlTFjazNdNnFdyE\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 767,
    "path": "../public/flags/us.svg"
  },
  "/flags/uy.svg": {
    "type": "image/svg+xml",
    "etag": "\"2284-R+a6cWLAu7M0FsHVM/kN4IBtYpY\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 8836,
    "path": "../public/flags/uy.svg"
  },
  "/flags/uz.svg": {
    "type": "image/svg+xml",
    "etag": "\"4db-F8sr1ESNO8bfF2f/W4LoM4uwBjY\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 1243,
    "path": "../public/flags/uz.svg"
  },
  "/flags/va.svg": {
    "type": "image/svg+xml",
    "etag": "\"22953-kinPIol/JzP26nRQaWizWsDR51Q\"",
    "mtime": "2024-01-03T11:02:53.000Z",
    "size": 141651,
    "path": "../public/flags/va.svg"
  },
  "/flags/vc.svg": {
    "type": "image/svg+xml",
    "etag": "\"153-5tMpRwZGqb3d+668HhNz+CcLcW0\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 339,
    "path": "../public/flags/vc.svg"
  },
  "/flags/ve.svg": {
    "type": "image/svg+xml",
    "etag": "\"760-0CQyG5AgLQa6LVbl2GmgwhVFWWA\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 1888,
    "path": "../public/flags/ve.svg"
  },
  "/flags/vg.svg": {
    "type": "image/svg+xml",
    "etag": "\"39b3-0XDav0xGVAsVAfbz8CvCC3IK/o8\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 14771,
    "path": "../public/flags/vg.svg"
  },
  "/flags/vi.svg": {
    "type": "image/svg+xml",
    "etag": "\"4e0e-F8Pcs2DVT12rD0rl63O5XksvThI\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 19982,
    "path": "../public/flags/vi.svg"
  },
  "/flags/vn.svg": {
    "type": "image/svg+xml",
    "etag": "\"c3-lNs4OSLhhvVZCfwMZHCFdqHZefU\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 195,
    "path": "../public/flags/vn.svg"
  },
  "/flags/vu.svg": {
    "type": "image/svg+xml",
    "etag": "\"a37-evH+/esXgg60FjhIb1huhvie/FM\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 2615,
    "path": "../public/flags/vu.svg"
  },
  "/flags/wf.svg": {
    "type": "image/svg+xml",
    "etag": "\"1a0-6KPhARh4/j93jy29JyVx7gkPJSk\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 416,
    "path": "../public/flags/wf.svg"
  },
  "/flags/ws.svg": {
    "type": "image/svg+xml",
    "etag": "\"280-GjzAMJMLYBzZ5eJYQixiepDiLeg\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 640,
    "path": "../public/flags/ws.svg"
  },
  "/flags/xk.svg": {
    "type": "image/svg+xml",
    "etag": "\"1157-Q7Z+XAhm9IJ9CHaD4nS9cOlTjjE\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 4439,
    "path": "../public/flags/xk.svg"
  },
  "/flags/ye.svg": {
    "type": "image/svg+xml",
    "etag": "\"b3-ceWpjFVulD2rmHc3kNh0Z3/tgK0\"",
    "mtime": "2024-01-02T16:00:00.000Z",
    "size": 179,
    "path": "../public/flags/ye.svg"
  },
  "/flags/yt.svg": {
    "type": "image/svg+xml",
    "etag": "\"7cf5-d5OkJYlA8zgjA5LDV+7Zap2X6Ag\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 31989,
    "path": "../public/flags/yt.svg"
  },
  "/flags/za.svg": {
    "type": "image/svg+xml",
    "etag": "\"236-33cUmKAaJCdHUcx1SP4BkNGnBRk\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 566,
    "path": "../public/flags/za.svg"
  },
  "/flags/zm.svg": {
    "type": "image/svg+xml",
    "etag": "\"1469-8OkMBt7J/frveICvbMLqCZldOKM\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 5225,
    "path": "../public/flags/zm.svg"
  },
  "/flags/zw.svg": {
    "type": "image/svg+xml",
    "etag": "\"6d0-m3sPESxG5uSRf+OhvaEvNdwYHTQ\"",
    "mtime": "2024-01-03T09:15:15.000Z",
    "size": 1744,
    "path": "../public/flags/zw.svg"
  },
  "/_nuxt/builds/latest.json": {
    "type": "application/json",
    "etag": "\"47-FfnEwqbMbGHduZfsaQopr8FgVZQ\"",
    "mtime": "2024-06-20T14:36:38.540Z",
    "size": 71,
    "path": "../public/_nuxt/builds/latest.json"
  },
  "/_nuxt/builds/meta/b187f70d-2ef1-44b4-9a8f-5c81274ae1d6.json": {
    "type": "application/json",
    "etag": "\"8b-VjRGbIccoi8vOan5hAE0zW06oC4\"",
    "mtime": "2024-06-20T14:36:38.542Z",
    "size": 139,
    "path": "../public/_nuxt/builds/meta/b187f70d-2ef1-44b4-9a8f-5c81274ae1d6.json"
  }
};

const _DRIVE_LETTER_START_RE = /^[A-Za-z]:\//;
function normalizeWindowsPath(input = "") {
  if (!input) {
    return input;
  }
  return input.replace(/\\/g, "/").replace(_DRIVE_LETTER_START_RE, (r) => r.toUpperCase());
}
const _IS_ABSOLUTE_RE = /^[/\\](?![/\\])|^[/\\]{2}(?!\.)|^[A-Za-z]:[/\\]/;
const _DRIVE_LETTER_RE = /^[A-Za-z]:$/;
function cwd() {
  if (typeof process !== "undefined" && typeof process.cwd === "function") {
    return process.cwd().replace(/\\/g, "/");
  }
  return "/";
}
const resolve = function(...arguments_) {
  arguments_ = arguments_.map((argument) => normalizeWindowsPath(argument));
  let resolvedPath = "";
  let resolvedAbsolute = false;
  for (let index = arguments_.length - 1; index >= -1 && !resolvedAbsolute; index--) {
    const path = index >= 0 ? arguments_[index] : cwd();
    if (!path || path.length === 0) {
      continue;
    }
    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute = isAbsolute(path);
  }
  resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute);
  if (resolvedAbsolute && !isAbsolute(resolvedPath)) {
    return `/${resolvedPath}`;
  }
  return resolvedPath.length > 0 ? resolvedPath : ".";
};
function normalizeString(path, allowAboveRoot) {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let char = null;
  for (let index = 0; index <= path.length; ++index) {
    if (index < path.length) {
      char = path[index];
    } else if (char === "/") {
      break;
    } else {
      char = "/";
    }
    if (char === "/") {
      if (lastSlash === index - 1 || dots === 1) ; else if (dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res[res.length - 1] !== "." || res[res.length - 2] !== ".") {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf("/");
            if (lastSlashIndex === -1) {
              res = "";
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
            }
            lastSlash = index;
            dots = 0;
            continue;
          } else if (res.length > 0) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = index;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          res += res.length > 0 ? "/.." : "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) {
          res += `/${path.slice(lastSlash + 1, index)}`;
        } else {
          res = path.slice(lastSlash + 1, index);
        }
        lastSegmentLength = index - lastSlash - 1;
      }
      lastSlash = index;
      dots = 0;
    } else if (char === "." && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}
const isAbsolute = function(p) {
  return _IS_ABSOLUTE_RE.test(p);
};
const dirname = function(p) {
  const segments = normalizeWindowsPath(p).replace(/\/$/, "").split("/").slice(0, -1);
  if (segments.length === 1 && _DRIVE_LETTER_RE.test(segments[0])) {
    segments[0] += "/";
  }
  return segments.join("/") || (isAbsolute(p) ? "/" : ".");
};

function readAsset (id) {
  const serverDir = dirname(fileURLToPath(globalThis._importMeta_.url));
  return promises$1.readFile(resolve(serverDir, assets[id].path))
}

const publicAssetBases = {"/_nuxt/builds/meta":{"maxAge":31536000},"/_nuxt/builds":{"maxAge":1},"/_nuxt":{"maxAge":31536000}};

function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

function getAsset (id) {
  return assets[id]
}

const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = { gzip: ".gz", br: ".br" };
const _f4b49z = eventHandler((event) => {
  if (event.method && !METHODS.has(event.method)) {
    return;
  }
  let id = decodePath(
    withLeadingSlash(withoutTrailingSlash(parseURL(event.path).pathname))
  );
  let asset;
  const encodingHeader = String(
    getRequestHeader(event, "accept-encoding") || ""
  );
  const encodings = [
    ...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(),
    ""
  ];
  if (encodings.length > 1) {
    setResponseHeader(event, "Vary", "Accept-Encoding");
  }
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      removeResponseHeader(event, "Cache-Control");
      throw createError$1({
        statusMessage: "Cannot find static asset " + id,
        statusCode: 404
      });
    }
    return;
  }
  const ifNotMatch = getRequestHeader(event, "if-none-match") === asset.etag;
  if (ifNotMatch) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  const ifModifiedSinceH = getRequestHeader(event, "if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  if (asset.type && !getResponseHeader(event, "Content-Type")) {
    setResponseHeader(event, "Content-Type", asset.type);
  }
  if (asset.etag && !getResponseHeader(event, "ETag")) {
    setResponseHeader(event, "ETag", asset.etag);
  }
  if (asset.mtime && !getResponseHeader(event, "Last-Modified")) {
    setResponseHeader(event, "Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !getResponseHeader(event, "Content-Encoding")) {
    setResponseHeader(event, "Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !getResponseHeader(event, "Content-Length")) {
    setResponseHeader(event, "Content-Length", asset.size);
  }
  return readAsset(id);
});

const _EWRUMc = lazyEventHandler(() => {
  const opts = useRuntimeConfig().ipx || {};
  const fsDir = opts?.fs?.dir ? (Array.isArray(opts.fs.dir) ? opts.fs.dir : [opts.fs.dir]).map((dir) => isAbsolute(dir) ? dir : fileURLToPath(new URL(dir, globalThis._importMeta_.url))) : void 0;
  const fsStorage = opts.fs?.dir ? ipxFSStorage({ ...opts.fs, dir: fsDir }) : void 0;
  const httpStorage = opts.http?.domains ? ipxHttpStorage({ ...opts.http }) : void 0;
  if (!fsStorage && !httpStorage) {
    throw new Error("IPX storage is not configured!");
  }
  const ipxOptions = {
    ...opts,
    storage: fsStorage || httpStorage,
    httpStorage
  };
  const ipx = createIPX(ipxOptions);
  const ipxHandler = createIPXH3Handler(ipx);
  return useBase(opts.baseURL, ipxHandler);
});

const _lazy_bYntET = () => import('./routes/renderer.mjs').then(function (n) { return n.r; });

const handlers = [
  { route: '', handler: _f4b49z, lazy: false, middleware: true, method: undefined },
  { route: '/__nuxt_error', handler: _lazy_bYntET, lazy: true, middleware: false, method: undefined },
  { route: '/_ipx/**', handler: _EWRUMc, lazy: false, middleware: false, method: undefined },
  { route: '/**', handler: _lazy_bYntET, lazy: true, middleware: false, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const captureError = (error, context = {}) => {
    const promise = hooks.callHookParallel("error", error, context).catch((_err) => {
      console.error("Error while capturing another error", _err);
    });
    if (context.event && isEvent(context.event)) {
      const errors = context.event.context.nitro?.errors;
      if (errors) {
        errors.push({ error, context });
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise);
      }
    }
  };
  const h3App = createApp({
    debug: destr(false),
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error, event);
    },
    onRequest: async (event) => {
      await nitroApp.hooks.callHook("request", event).catch((error) => {
        captureError(error, { event, tags: ["request"] });
      });
    },
    onBeforeResponse: async (event, response) => {
      await nitroApp.hooks.callHook("beforeResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    },
    onAfterResponse: async (event, response) => {
      await nitroApp.hooks.callHook("afterResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    }
  });
  const router = createRouter({
    preemptive: true
  });
  const localCall = createCall(toNodeListener(h3App));
  const _localFetch = createFetch(localCall, globalThis.fetch);
  const localFetch = (input, init) => _localFetch(input, init).then(
    (response) => normalizeFetchResponse(response)
  );
  const $fetch = createFetch$1({
    fetch: localFetch,
    Headers: Headers$1,
    defaults: { baseURL: config.app.baseURL }
  });
  globalThis.$fetch = $fetch;
  h3App.use(createRouteRulesHandler({ localFetch }));
  h3App.use(
    eventHandler((event) => {
      event.context.nitro = event.context.nitro || { errors: [] };
      const envContext = event.node.req?.__unenv__;
      if (envContext) {
        Object.assign(event.context, envContext);
      }
      event.fetch = (req, init) => fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = (req, init) => fetchWithEvent(event, req, init, {
        fetch: $fetch
      });
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = [];
        }
        event.context.nitro._waitUntilPromises.push(promise);
        if (envContext?.waitUntil) {
          envContext.waitUntil(promise);
        }
      };
      event.captureError = (error, context) => {
        captureError(error, { event, ...context });
      };
    })
  );
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router.handler);
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError
  };
  for (const plugin of plugins) {
    try {
      plugin(app);
    } catch (err) {
      captureError(err, { tags: ["plugin"] });
      throw err;
    }
  }
  return app;
}
const nitroApp = createNitroApp();
const useNitroApp = () => nitroApp;

const debug = (...args) => {
};
function GracefulShutdown(server, opts) {
  opts = opts || {};
  const options = Object.assign(
    {
      signals: "SIGINT SIGTERM",
      timeout: 3e4,
      development: false,
      forceExit: true,
      onShutdown: (signal) => Promise.resolve(signal),
      preShutdown: (signal) => Promise.resolve(signal)
    },
    opts
  );
  let isShuttingDown = false;
  const connections = {};
  let connectionCounter = 0;
  const secureConnections = {};
  let secureConnectionCounter = 0;
  let failed = false;
  let finalRun = false;
  function onceFactory() {
    let called = false;
    return (emitter, events, callback) => {
      function call() {
        if (!called) {
          called = true;
          return Reflect.apply(callback, this, arguments);
        }
      }
      for (const e of events) {
        emitter.on(e, call);
      }
    };
  }
  const signals = options.signals.split(" ").map((s) => s.trim()).filter((s) => s.length > 0);
  const once = onceFactory();
  once(process, signals, (signal) => {
    shutdown(signal).then(() => {
      if (options.forceExit) {
        process.exit(failed ? 1 : 0);
      }
    }).catch((err) => {
      process.exit(1);
    });
  });
  function isFunction(functionToCheck) {
    const getType = Object.prototype.toString.call(functionToCheck);
    return /^\[object\s([A-Za-z]+)?Function]$/.test(getType);
  }
  function destroy(socket, force = false) {
    if (socket._isIdle && isShuttingDown || force) {
      socket.destroy();
      if (socket.server instanceof http.Server) {
        delete connections[socket._connectionId];
      } else {
        delete secureConnections[socket._connectionId];
      }
    }
  }
  function destroyAllConnections(force = false) {
    for (const key of Object.keys(connections)) {
      const socket = connections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        destroy(socket);
      }
    }
    for (const key of Object.keys(secureConnections)) {
      const socket = secureConnections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        destroy(socket);
      }
    }
  }
  server.on("request", function(req, res) {
    req.socket._isIdle = false;
    if (isShuttingDown && !res.headersSent) {
      res.setHeader("connection", "close");
    }
    res.on("finish", function() {
      req.socket._isIdle = true;
      destroy(req.socket);
    });
  });
  server.on("connection", function(socket) {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = connectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      connections[id] = socket;
      socket.once("close", () => {
        delete connections[socket._connectionId];
      });
    }
  });
  server.on("secureConnection", (socket) => {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = secureConnectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      secureConnections[id] = socket;
      socket.once("close", () => {
        delete secureConnections[socket._connectionId];
      });
    }
  });
  process.on("close", function() {
  });
  function shutdown(sig) {
    function cleanupHttp() {
      destroyAllConnections();
      return new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            return reject(err);
          }
          return resolve(true);
        });
      });
    }
    if (options.development) {
      return process.exit(0);
    }
    function finalHandler() {
      if (!finalRun) {
        finalRun = true;
        if (options.finally && isFunction(options.finally)) {
          options.finally();
        }
      }
      return Promise.resolve();
    }
    function waitForReadyToShutDown(totalNumInterval) {
      if (totalNumInterval === 0) {
        debug(
          `Could not close connections in time (${options.timeout}ms), will forcefully shut down`
        );
        return Promise.resolve(true);
      }
      const allConnectionsClosed = Object.keys(connections).length === 0 && Object.keys(secureConnections).length === 0;
      if (allConnectionsClosed) {
        return Promise.resolve(false);
      }
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(waitForReadyToShutDown(totalNumInterval - 1));
        }, 250);
      });
    }
    if (isShuttingDown) {
      return Promise.resolve();
    }
    return options.preShutdown(sig).then(() => {
      isShuttingDown = true;
      cleanupHttp();
    }).then(() => {
      const pollIterations = options.timeout ? Math.round(options.timeout / 250) : 0;
      return waitForReadyToShutDown(pollIterations);
    }).then((force) => {
      if (force) {
        destroyAllConnections(force);
      }
      return options.onShutdown(sig);
    }).then(finalHandler).catch((err) => {
      const errString = typeof err === "string" ? err : JSON.stringify(err);
      failed = true;
      throw errString;
    });
  }
  function shutdownManual() {
    return shutdown("manual");
  }
  return shutdownManual;
}

function getGracefulShutdownConfig() {
  return {
    disabled: !!process.env.NITRO_SHUTDOWN_DISABLED,
    signals: (process.env.NITRO_SHUTDOWN_SIGNALS || "SIGTERM SIGINT").split(" ").map((s) => s.trim()),
    timeout: Number.parseInt(process.env.NITRO_SHUTDOWN_TIMEOUT, 10) || 3e4,
    forceExit: !process.env.NITRO_SHUTDOWN_NO_FORCE_EXIT
  };
}
function setupGracefulShutdown(listener, nitroApp) {
  const shutdownConfig = getGracefulShutdownConfig();
  if (shutdownConfig.disabled) {
    return;
  }
  GracefulShutdown(listener, {
    signals: shutdownConfig.signals.join(" "),
    timeout: shutdownConfig.timeout,
    forceExit: shutdownConfig.forceExit,
    onShutdown: async () => {
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn("Graceful shutdown timeout, force exiting...");
          resolve();
        }, shutdownConfig.timeout);
        nitroApp.hooks.callHook("close").catch((err) => {
          console.error(err);
        }).finally(() => {
          clearTimeout(timeout);
          resolve();
        });
      });
    }
  });
}

const cert = process.env.NITRO_SSL_CERT;
const key = process.env.NITRO_SSL_KEY;
const server = cert && key ? new Server({ key, cert }, toNodeListener(nitroApp.h3App)) : new Server$1(toNodeListener(nitroApp.h3App));
const port = destr(process.env.NITRO_PORT || process.env.PORT) || 3e3;
const host = process.env.NITRO_HOST || process.env.HOST;
const path = process.env.NITRO_UNIX_SOCKET;
const listener = server.listen(path ? { path } : { port, host }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  const protocol = cert && key ? "https" : "http";
  const addressInfo = listener.address();
  if (typeof addressInfo === "string") {
    console.log(`Listening on unix socket ${addressInfo}`);
    return;
  }
  const baseURL = (useRuntimeConfig().app.baseURL || "").replace(/\/$/, "");
  const url = `${protocol}://${addressInfo.family === "IPv6" ? `[${addressInfo.address}]` : addressInfo.address}:${addressInfo.port}${baseURL}`;
  console.log(`Listening on ${url}`);
});
trapUnhandledNodeErrors();
setupGracefulShutdown(listener, nitroApp);
const nodeServer = {};

export { $fetch as $, nodeServer as A, send as a, setResponseStatus as b, setResponseHeaders as c, useRuntimeConfig as d, eventHandler as e, getQuery as f, getResponseStatus as g, createError$1 as h, getRouteRules as i, joinRelativeURL as j, getResponseStatusText as k, hasProtocol as l, isScriptProtocol as m, joinURL as n, hash as o, sanitizeStatusCode as p, createHooks as q, createRouter$1 as r, setResponseHeader as s, toRouteMatcher as t, useNitroApp as u, defu as v, withQuery as w, parseQuery as x, withTrailingSlash as y, withoutTrailingSlash as z };
//# sourceMappingURL=runtime.mjs.map
