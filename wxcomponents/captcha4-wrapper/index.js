Component({
  properties: {
    captchaId: {
      type: String,
      value: "",
    },
    useNativeButton: {
      type: Boolean,
      value: false,
    },
  },
  lifetimes: {
    ready() {
      this._interceptInnerEvents();
    },
  },
  methods: {
    _interceptInnerEvents() {
      const inner = this.selectComponent("#captchaInner");
      if (!inner || this._intercepted) {
        return;
      }
      this._intercepted = true;

      const originalTriggerEvent = inner.triggerEvent.bind(inner);
      const self = this;

      inner.triggerEvent = function (name, detail, options) {
        originalTriggerEvent(name, detail, options);
        const methodName = "on" + name.charAt(0).toUpperCase() + name.slice(1);
        if (self[methodName]) {
          self[methodName]({ detail: detail });
        }
      };
    },

    showCaptcha() {
      this._interceptInnerEvents();
      const captcha = this.selectComponent("#captchaInner");
      if (captcha && typeof captcha.showCaptcha === "function") {
        captcha.showCaptcha();
      }
    },
    reset() {
      const captcha = this.selectComponent("#captchaInner");
      if (captcha && typeof captcha.reset === "function") {
        captcha.reset();
      }
    },
    hiddenCaptcha() {
      const captcha = this.selectComponent("#captchaInner");
      if (captcha && typeof captcha.hiddenCaptcha === "function") {
        captcha.hiddenCaptcha();
      }
    },
    onSuccess(e) {
      const detail = e && e.detail ? e.detail : e;
      this.triggerEvent("success", detail);
      if (typeof uni !== "undefined" && uni.$emit) {
        uni.$emit("captcha4:success", detail);
      }
    },
    onReady(e) {
      const detail = e && e.detail ? e.detail : e;
      this.triggerEvent("ready", detail);
      if (typeof uni !== "undefined" && uni.$emit) {
        uni.$emit("captcha4:ready", detail);
      }
    },
    onClose(e) {
      const detail = e && e.detail ? e.detail : e;
      this.triggerEvent("close", detail);
      if (typeof uni !== "undefined" && uni.$emit) {
        uni.$emit("captcha4:close", detail);
      }
    },
    onError(e) {
      const detail = e && e.detail ? e.detail : e;
      this.triggerEvent("error", detail);
      if (typeof uni !== "undefined" && uni.$emit) {
        uni.$emit("captcha4:error", detail);
      }
    },
    onFail(e) {
      const detail = e && e.detail ? e.detail : e;
      this.triggerEvent("fail", detail);
      if (typeof uni !== "undefined" && uni.$emit) {
        uni.$emit("captcha4:fail", detail);
      }
    },
  },
});
