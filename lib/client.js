window.__ModuleLoader__.load({
	id: "@dsh-external/dsh-plugin-astrology",
	factory: (require) => {
		var exports = { exports: {} }.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		let _deepseek_ai_dsh_client_store = require("@deepseek-ai/dsh-client-store");
		//#region src/client/astrology/settings-controller.ts
		/** Own committed host state separately from editable names and in-flight operations. */
		function createSettingsController(api) {
			let snapshot = {
				draft: {
					chinese: "星术",
					english: "ASTROLOGY"
				},
				loading: true,
				busy: false,
				notice: ""
			};
			const listeners = /* @__PURE__ */ new Set();
			let active = false;
			let generation = 0;
			let revision = 0;
			let readId = 0;
			const publish = (changes) => {
				snapshot = {
					...snapshot,
					...changes
				};
				listeners.forEach((listener) => listener());
			};
			const accept = (view) => {
				const old = snapshot.view;
				const draft = {
					chinese: !old || snapshot.draft.chinese === old.brandChinese ? view.brandChinese : snapshot.draft.chinese,
					english: !old || snapshot.draft.english === old.brandEnglish ? view.brandEnglish : snapshot.draft.english
				};
				publish({
					view,
					draft,
					loading: false,
					notice: ""
				});
			};
			const refresh = async () => {
				if (!active || snapshot.busy) return;
				const session = generation;
				const request = ++readId;
				const before = revision;
				publish({
					loading: true,
					notice: ""
				});
				try {
					const view = await api.state();
					if (active && session === generation && request === readId && before === revision) accept(view);
				} catch {
					if (active && session === generation && request === readId && before === revision) publish({
						loading: false,
						notice: "loadFailure"
					});
				}
			};
			const run = async (operation, kind = "settings") => {
				if (!active || snapshot.busy || snapshot.loading || !snapshot.view) return false;
				const session = generation;
				const beforeRevision = revision;
				const before = snapshot.view;
				publish({
					busy: true,
					notice: ""
				});
				try {
					const view = await operation();
					if (!active || session !== generation) return false;
					if (view && revision === beforeRevision) accept(view);
					if (view && kind === "brand") {
						const committed = snapshot.view;
						publish({ draft: {
							chinese: committed.brandChinese,
							english: committed.brandEnglish
						} });
					}
					const changed = view && Object.keys(before).some((key) => before[key] !== view[key]);
					publish({ notice: kind === "preview" ? "" : changed ? "saved" : "unchanged" });
					return true;
				} catch {
					if (active && session === generation) publish({ notice: kind === "preview" ? "previewFailure" : "failure" });
					return false;
				} finally {
					if (active && session === generation) publish({ busy: false });
				}
			};
			return {
				getSnapshot: () => snapshot,
				subscribe: (listener) => {
					listeners.add(listener);
					return () => {
						listeners.delete(listener);
					};
				},
				start: () => {
					active = true;
					const session = ++generation;
					publish({ busy: false });
					const stop = api.onSettings((view) => {
						if (!active || session !== generation) return;
						revision++;
						accept(view);
					});
					refresh();
					return () => {
						if (session !== generation || !active) return;
						active = false;
						generation++;
						stop();
					};
				},
				refresh,
				editBrand: (key, value) => {
					if (!active || snapshot.busy || !snapshot.view) return;
					publish({
						draft: {
							...snapshot.draft,
							[key]: value
						},
						notice: ""
					});
				},
				configure: (changes) => run(() => api.configure(changes)),
				saveBrand: () => {
					const { chinese, english } = snapshot.draft;
					return run(() => api.configure({
						brandChinese: chinese,
						brandEnglish: english
					}), "brand");
				},
				chooseVideo: () => run(() => api.chooseVideo()),
				chooseBackground: () => run(() => api.chooseBackground()),
				preview: () => run(() => api.presentation(true), "preview")
			};
		}
		//#endregion
		//#region src/client/astrology/Astrology.module.css
		var Astrology_module_default = {
			"brand": "tM8Epq_brand",
			"buttonGroup": "tM8Epq_buttonGroup",
			"card": "tM8Epq_card",
			"cardFooter": "tM8Epq_cardFooter",
			"group": "tM8Epq_group",
			"groupHeader": "tM8Epq_groupHeader",
			"helper": "tM8Epq_helper",
			"inlineNote": "tM8Epq_inlineNote",
			"loading": "tM8Epq_loading",
			"pageHeader": "tM8Epq_pageHeader",
			"primaryButton": "tM8Epq_primaryButton",
			"row": "tM8Epq_row",
			"secondaryButton": "tM8Epq_secondaryButton",
			"settings": "tM8Epq_settings",
			"status": "tM8Epq_status",
			"textInput": "tM8Epq_textInput"
		};
		//#endregion
		//#region src/client/astrology/Astrology.tsx
		/** Native branding and feature-owned settings, rendered through the existing slots. */
		/** @returns Two-line personal brand. */
		function AstrologyBrandName({ useStore }) {
			const chinese = useStore((state) => state.chinese);
			const english = useStore((state) => state.english);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				className: Astrology_module_default.brand,
				"data-astrology-brand": true,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: chinese }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: english })]
			});
		}
		/** @param props Host-requested mark size. @returns Personal star mark. */
		function AstrologyBrandMark({ size }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				"aria-hidden": "true",
				style: {
					fontSize: size,
					color: "var(--dsw-alias-brand-primary)"
				},
				children: "✦"
			});
		}
		/** @param props Settings owner, native operations and localized copy. @returns Grouped personalization controls. */
		function AstrologySettings({ api, close, t }) {
			const controller = (0, react.useMemo)(() => createSettingsController(api), [api]);
			const { view, draft, busy, loading, notice } = (0, react.useSyncExternalStore)(controller.subscribe, controller.getSnapshot);
			(0, react.useEffect)(() => controller.start(), [controller]);
			const brandChanged = view !== void 0 && (draft.chinese !== view.brandChinese || draft.english !== view.brandEnglish);
			const backgroundLabel = view?.backgroundMedia === null || view?.backgroundMedia === void 0 ? t("backgroundDefault") : view.backgroundMedia === "mp4" ? t("backgroundMp4") : view.backgroundMedia === "webm" ? t("backgroundWebm") : view.backgroundMedia === "png" ? t("backgroundPng") : view.backgroundMedia === "jpg" ? t("backgroundJpg") : t("backgroundWebp");
			function updatePreference(key, value) {
				controller.configure({ [key]: value });
			}
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: Astrology_module_default.settings,
				"aria-label": t("title"),
				"aria-busy": busy || loading,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
						className: Astrology_module_default.pageHeader,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: t("title") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("description") })]
					}),
					loading && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: Astrology_module_default.loading,
						role: "status",
						children: t("loading")
					}),
					notice === "loadFailure" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: Astrology_module_default.cardFooter,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							role: "alert",
							children: t("loadFailure")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: Astrology_module_default.secondaryButton,
							disabled: loading || busy,
							onClick: () => {
								controller.refresh();
							},
							children: t("retry")
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: Astrology_module_default.group,
						"aria-labelledby": "astrology-brand-heading",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
							className: Astrology_module_default.groupHeader,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
								id: "astrology-brand-heading",
								children: t("brandSection")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("brandDescription") })]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("fieldset", {
							className: Astrology_module_default.card,
							disabled: busy || !view,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: Astrology_module_default.row,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("brandChinese") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										className: Astrology_module_default.textInput,
										maxLength: 24,
										value: draft.chinese,
										onChange: (event) => controller.editBrand("chinese", event.target.value.slice(0, 24))
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: Astrology_module_default.row,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("brandEnglish") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										className: Astrology_module_default.textInput,
										maxLength: 32,
										value: draft.english,
										onChange: (event) => controller.editBrand("english", event.target.value.slice(0, 32))
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: Astrology_module_default.cardFooter,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: Astrology_module_default.helper,
										children: t("brandScope")
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										className: Astrology_module_default.primaryButton,
										type: "button",
										disabled: !brandChanged || !draft.chinese.trim() || busy,
										onClick: () => {
											controller.saveBrand();
										},
										children: t("saveBrand")
									})]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: Astrology_module_default.group,
						"aria-labelledby": "astrology-background-heading",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
							className: Astrology_module_default.groupHeader,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
								id: "astrology-background-heading",
								children: t("backgroundSection")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("backgroundDescription") })]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("fieldset", {
							className: Astrology_module_default.card,
							disabled: busy || !view,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: Astrology_module_default.row,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("backgroundFit") }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
										value: view?.backgroundFit ?? "cover",
										onChange: (event) => updatePreference("backgroundFit", event.target.value === "contain" ? "contain" : "cover"),
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "cover",
											children: t("coverFit")
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "contain",
											children: t("contain")
										})]
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: Astrology_module_default.row,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("backgroundLoop") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: view?.backgroundLoop !== false,
										disabled: view?.backgroundMedia === "png" || view?.backgroundMedia === "jpg" || view?.backgroundMedia === "webp",
										onChange: (event) => updatePreference("backgroundLoop", event.target.checked)
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: Astrology_module_default.cardFooter,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: Astrology_module_default.helper,
										children: backgroundLabel
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: Astrology_module_default.secondaryButton,
										disabled: busy || !view,
										onClick: () => {
											controller.chooseBackground();
										},
										children: t("chooseBackground")
									})]
								}),
								(view?.backgroundMedia === "png" || view?.backgroundMedia === "jpg" || view?.backgroundMedia === "webp") && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: Astrology_module_default.inlineNote,
									children: t("imageLoopNote")
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: Astrology_module_default.group,
						"aria-labelledby": "astrology-intro-heading",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
							className: Astrology_module_default.groupHeader,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
								id: "astrology-intro-heading",
								children: t("introSection")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("introDescription") })]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("fieldset", {
							className: Astrology_module_default.card,
							disabled: busy || !view,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: Astrology_module_default.row,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("intro") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: view?.introEnabled === true,
										onChange: (event) => updatePreference("introEnabled", event.target.checked)
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: Astrology_module_default.row,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("sound") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: view?.videoSound === true,
										onChange: (event) => updatePreference("videoSound", event.target.checked)
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: Astrology_module_default.row,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("startupDisplay") }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
										value: view?.startupDisplay ?? "window",
										onChange: (event) => updatePreference("startupDisplay", event.target.value === "fullscreen" ? "fullscreen" : "window"),
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "window",
											children: t("window")
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "fullscreen",
											children: t("fullscreen")
										})]
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: Astrology_module_default.row,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("introFit") }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
										value: view?.videoFit ?? "contain",
										onChange: (event) => updatePreference("videoFit", event.target.value === "cover" ? "cover" : "contain"),
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "contain",
											children: t("contain")
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "cover",
											children: t("coverFit")
										})]
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: Astrology_module_default.cardFooter,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: Astrology_module_default.helper,
										children: t(view?.media ? "introVideo" : "introDefault")
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: Astrology_module_default.buttonGroup,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: Astrology_module_default.secondaryButton,
											disabled: busy || !view,
											onClick: () => {
												controller.chooseVideo();
											},
											children: t("chooseVideo")
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: Astrology_module_default.secondaryButton,
											disabled: busy || !view,
											onClick: () => {
												controller.preview().then((opened) => {
													if (opened) close();
												});
											},
											children: t("preview")
										})]
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: Astrology_module_default.inlineNote,
									children: t("introSequence")
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: Astrology_module_default.group,
						"aria-labelledby": "astrology-slider-heading",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
							className: Astrology_module_default.groupHeader,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
								id: "astrology-slider-heading",
								children: t("sliderSection")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("sliderNote") })]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("fieldset", {
							className: Astrology_module_default.card,
							disabled: busy || !view,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								className: Astrology_module_default.row,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("sliderStyle") }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
									value: view?.reasoningSliderStyle ?? "codex",
									onChange: (event) => updatePreference("reasoningSliderStyle", event.target.value === "minimal" ? "minimal" : event.target.value === "stage" ? "stage" : "codex"),
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "codex",
											children: t("sliderCodex")
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "stage",
											children: t("sliderStage")
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "minimal",
											children: t("sliderMinimal")
										})
									]
								})]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								className: Astrology_module_default.row,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("sliderMotion") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: view?.reasoningSliderMotion !== false,
									onChange: (event) => updatePreference("reasoningSliderMotion", event.target.checked)
								})]
							})]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: Astrology_module_default.group,
						"aria-labelledby": "astrology-companion-heading",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
							className: Astrology_module_default.groupHeader,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
								id: "astrology-companion-heading",
								children: t("companionSection")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("companionDescription") })]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("fieldset", {
							className: Astrology_module_default.card,
							disabled: busy || !view,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								className: Astrology_module_default.row,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("pet") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: view?.petEnabled === true,
									onChange: (event) => updatePreference("petEnabled", event.target.checked)
								})]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: Astrology_module_default.inlineNote,
								children: t("companionHelp")
							})]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: Astrology_module_default.status,
						role: "status",
						"aria-live": "polite",
						children: t(notice === "loadFailure" ? "statusEmpty" : notice || "statusEmpty")
					})
				]
			});
		}
		//#endregion
		//#region src/client/astrology/store.ts
		/** Shared reactive label state for the primary workspace Astrology brand. */
		function createAstrologyBrandStore() {
			return (0, _deepseek_ai_dsh_client_store.defineStore)({
				init: () => ({
					chinese: "星术",
					english: "ASTROLOGY"
				}),
				actions: { sync: (draft, chinese, english) => {
					draft.chinese = chinese;
					draft.english = english;
				} }
			});
		}
		//#endregion
		//#region src/client/astrology/observe.ts
		/** A settings event supersedes the initial snapshot; disposal invalidates pending reads. */
		function observePreferences(api, receive, fail = () => void 0) {
			let live = true;
			let updated = false;
			const stop = api.onSettings((view) => {
				if (!live) return;
				updated = true;
				receive(view);
			});
			Promise.resolve().then(() => live ? api.state() : void 0).then((view) => {
				if (live && !updated && view) receive(view);
			}, (error) => {
				if (live && !updated) fail(error);
			});
			return () => {
				if (!live) return;
				live = false;
				stop();
			};
		}
		//#endregion
		//#region src/client/astrology/adapter.ts
		const zh = {
			nav: "星术",
			title: "星术 · ASTROLOGY",
			description: "个性化侧栏名称、主界面背景、启动片头、思考强度控件与桌面伙伴。",
			brandSection: "侧栏名称",
			brandDescription: "自定义侧栏星形标志旁的两行文字。",
			brandChinese: "中文名称",
			brandEnglish: "英文名称",
			brandScope: "仅修改主界面侧栏文字；其他“星术”名称保持不变。",
			saveBrand: "保存名称",
			backgroundSection: "主界面背景",
			backgroundDescription: "应用进入后在新会话、会话内容和设置页面显示；欢迎向导与片头动画不受影响。",
			backgroundFit: "画面适配",
			backgroundLoop: "循环播放视频",
			backgroundDefault: "当前：未选择背景",
			backgroundMp4: "当前：自定义 MP4 视频",
			backgroundWebm: "当前：自定义 WebM 视频",
			backgroundPng: "当前：自定义 PNG 图片",
			backgroundJpg: "当前：自定义 JPEG 图片",
			backgroundWebp: "当前：自定义 WebP 图片",
			imageLoopNote: "静态图片不需要循环播放；选择视频后将按此开关设置循环。",
			chooseBackground: "更换背景图片或视频",
			introSection: "启动片头",
			introDescription: "管理进入主界面前播放的片头视频与窗口行为。",
			intro: "启动时播放片头",
			sound: "播放片头声音",
			startupDisplay: "启动窗口",
			window: "跟随窗口（默认）",
			fullscreen: "全屏启动",
			introFit: "片头画面适配",
			contain: "完整显示",
			coverFit: "铺满并裁切",
			introVideo: "已选择自定义片头视频",
			introDefault: "未导入时使用默认星术动画封面",
			chooseVideo: "更换片头视频",
			preview: "预览片头",
			introSequence: "片头顺序：视频播放 → 星术 Logo 动画 → 主界面。播放中按 Esc 可跳过。全屏启动后可按 F11 切换。",
			sliderSection: "思考强度控件",
			sliderStyle: "滑动条样式",
			sliderCodex: "跟随主题（推荐）",
			sliderStage: "舞台紫金",
			sliderMinimal: "极简中性",
			sliderMotion: "滑动过渡动效",
			sliderNote: "只调整会话模型菜单中思考强度滑动条的外观，不改变模型档位或实际思考强度。",
			companionSection: "桌面伙伴",
			companionDescription: "控制悬浮桌面伙伴的显示。",
			pet: "显示桌面伙伴",
			companionHelp: "长按伙伴约 0.35 秒后拖动；右键可打开菜单。悬停会触发动作。",
			statusEmpty: "",
			saved: "设置已保存。",
			failure: "保存失败，请重试。",
			loading: "正在读取设置…",
			unchanged: "设置未更改。",
			loadFailure: "无法读取设置，请重试。",
			retry: "重新读取",
			previewFailure: "无法预览片头，请重试。",
			unsupportedTitle: "需要官方桌面扩展接口",
			unsupportedBody: "星术桌面功能需要官方 DeepSeek Harness Desktop 提供 Astrology API v1。请升级到支持该接口的 Desktop 版本后重启。"
		};
		const en = {
			nav: "Astrology",
			title: "星术 · ASTROLOGY",
			description: "Personalize the sidebar name, workspace background, startup intro, reasoning slider and desktop companion.",
			brandSection: "Sidebar name",
			brandDescription: "Change the two lines beside the star mark in the sidebar.",
			brandChinese: "Chinese name",
			brandEnglish: "English name",
			brandScope: "Only the primary sidebar text changes; other Astrology names stay fixed.",
			saveBrand: "Save name",
			backgroundSection: "Workspace background",
			backgroundDescription: "Shown in new sessions, conversations and settings after entering the app. The welcome wizard and intro animation are unaffected.",
			backgroundFit: "Image framing",
			backgroundLoop: "Loop video",
			backgroundDefault: "Current: no background selected",
			backgroundMp4: "Current: custom MP4 video",
			backgroundWebm: "Current: custom WebM video",
			backgroundPng: "Current: custom PNG image",
			backgroundJpg: "Current: custom JPEG image",
			backgroundWebp: "Current: custom WebP image",
			imageLoopNote: "Static images do not loop. This setting applies when a video is selected.",
			chooseBackground: "Choose background image or video",
			introSection: "Startup intro",
			introDescription: "Manage the video shown before the primary workspace opens.",
			intro: "Play intro on launch",
			sound: "Play intro audio",
			startupDisplay: "Startup window",
			window: "Follow window (default)",
			fullscreen: "Start fullscreen",
			introFit: "Intro framing",
			contain: "Show entire image",
			coverFit: "Fill and crop",
			introVideo: "A custom intro video is selected",
			introDefault: "Uses the default Astrology animation cover when no video is imported",
			chooseVideo: "Choose intro video",
			preview: "Preview intro",
			introSequence: "Sequence: video → Astrology logo animation → workspace. Press Esc to skip during playback. Press F11 to toggle fullscreen.",
			sliderSection: "Reasoning slider",
			sliderStyle: "Slider style",
			sliderCodex: "Follow theme (recommended)",
			sliderStage: "Stage violet",
			sliderMinimal: "Minimal neutral",
			sliderMotion: "Slider transition",
			sliderNote: "Changes only the reasoning slider appearance in the conversation model menu, not the model level or actual reasoning strength.",
			companionSection: "Desktop companion",
			companionDescription: "Control the floating desktop companion.",
			pet: "Show desktop companion",
			companionHelp: "Hold for about 0.35 seconds to drag. Right-click for its menu; hovering triggers an action.",
			statusEmpty: "",
			saved: "Settings saved.",
			failure: "Save failed. Please try again.",
			loading: "Loading settings…",
			unchanged: "Settings unchanged.",
			loadFailure: "Could not load settings. Please try again.",
			retry: "Retry",
			previewFailure: "Could not preview the intro. Please try again.",
			unsupportedTitle: "Official Desktop API required",
			unsupportedBody: "Astrology Desktop features require Astrology API v1 from the official DeepSeek Harness Desktop. Upgrade to a Desktop release that includes this API, then restart."
		};
		/** @param ctx Child context with locale and slot services. @param api Restricted native carrier. */
		function mountAstrology(ctx, api) {
			const ns = "brand.astrology";
			ctx.effect(() => ctx.locale.register(ns, {
				zh,
				en
			}), "Astrology dictionaries");
			const t = ctx.locale.bind(ns);
			const store = createAstrologyBrandStore();
			let brandActions;
			let latest;
			const syncBrand = (chinese, english) => {
				brandActions?.sync(chinese, english);
			};
			ctx.effect(() => observePreferences(api, (view) => {
				latest = view;
				syncBrand(view.brandChinese, view.brandEnglish);
			}), "Astrology brand preferences");
			ctx.slots.inject("sidebar.brand.mark", () => ctx.slots.register({ name: "sidebar.brand.mark" }, AstrologyBrandMark));
			ctx.slots.inject("sidebar.brand.name", () => ctx.slots.register({
				name: "sidebar.brand.name",
				store,
				inject: (actions) => {
					brandActions = actions;
					if (latest) actions.sync(latest.brandChinese, latest.brandEnglish);
					return {};
				}
			}, AstrologyBrandName));
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "astrology",
				order: 12,
				label: () => t("nav"),
				locale: ns,
				store,
				inject: () => ({ api })
			}, AstrologySettings));
		}
		//#endregion
		//#region src/client/astrology/Unsupported.tsx
		/** @param props Slot locale and settings presentation props. @returns Desktop compatibility instructions. */
		function AstrologyUnsupported({ t }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("section", {
				className: Astrology_module_default.settings,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
					className: Astrology_module_default.pageHeader,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: t("unsupportedTitle") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("unsupportedBody") })]
				})
			});
		}
		//#endregion
		//#region src/client/theme/palette.ts
		const colors = {
			canvas: {
				light: "#F7F4FB",
				dark: "#100D18"
			},
			panel: {
				light: "#FFFFFF",
				dark: "#1C1728"
			},
			raised: {
				light: "#F3EEF9",
				dark: "#251E34"
			},
			overlay: {
				light: "#FCFAFF",
				dark: "#30263F"
			},
			sidebar: {
				light: "#F0EAF7",
				dark: "#171221"
			},
			text: {
				light: "#282238",
				dark: "#F4EFFA"
			},
			secondary: {
				light: "#635571",
				dark: "#C4B5D5"
			},
			tertiary: {
				light: "#71627E",
				dark: "#AA98BD"
			},
			accent: {
				light: "#6F46AD",
				dark: "#A78BFA"
			},
			hover: {
				light: "#603896",
				dark: "#BDA5FF"
			},
			foreground: {
				light: "#FFFFFF",
				dark: "#20122F"
			},
			tint: {
				light: "#EAE0F7",
				dark: "#362947"
			},
			active: {
				light: "#DFD0F0",
				dark: "#49345E"
			},
			border: {
				light: "#D2C4E1",
				dark: "#51405F"
			},
			borderStrong: {
				light: "#A18AB9",
				dark: "#7C6690"
			},
			code: {
				light: "#F3EFF8",
				dark: "#15101F"
			},
			bubble: {
				light: "#ECE3F8",
				dark: "#322341"
			},
			gold: {
				light: "#825D24",
				dark: "#D8B56A"
			},
			error: {
				light: "#B32636",
				dark: "#FF8794"
			},
			errorTint: {
				light: "#FBEAED",
				dark: "#47232E"
			},
			success: {
				light: "#176943",
				dark: "#7CD8A7"
			},
			successTint: {
				light: "#E5F4EC",
				dark: "#1C392D"
			},
			warning: {
				light: "#895409",
				dark: "#EFBD67"
			},
			warningTint: {
				light: "#FBF1DE",
				dark: "#3F3220"
			},
			toast: {
				light: "#30253D",
				dark: "#30253D"
			},
			toastText: {
				light: "#F4EFFA",
				dark: "#F4EFFA"
			}
		};
		/** Exact light/dark pairs consumed by the official theme override service. */
		const themeOverrides = Object.fromEntries(Object.entries({
			"--dsw-alias-bg-base": "canvas",
			"--dsw-alias-bg-layer-1": "panel",
			"--dsw-alias-bg-layer-2": "raised",
			"--dsw-alias-bg-layer-3": "overlay",
			"--dsw-alias-bg-overlay": "overlay",
			"--dsw-alias-bg-module-platform": "raised",
			"--dsw-alias-bg-multi-select": "tint",
			"--dsw-alias-bg-document-preview": "code",
			"--dsw-alias-label-document-preview": "text",
			"--dsw-alias-border-l1": "border",
			"--dsw-alias-border-l2": "border",
			"--dsw-alias-border-l2-darkmode-thin": "border",
			"--dsw-alias-border-l3": "border",
			"--dsw-alias-border-l4": "borderStrong",
			"--dsw-alias-brand-primary": "accent",
			"--dsw-alias-brand-primary-invert": "foreground",
			"--dsw-alias-brand-primary-new-colorprimary-new-color": "accent",
			"--dsw-alias-brand-text": "accent",
			"--dsw-alias-button-primary-fill": "accent",
			"--dsw-alias-button-primary-hover": "hover",
			"--dsw-alias-button-primary-dimmed": "tint",
			"--dsw-alias-button-elevated-fill": "panel",
			"--dsw-alias-button-floating-fill": "panel",
			"--dsw-alias-button-floating-hover": "tint",
			"--dsw-alias-button-info-fill": "accent",
			"--dsw-alias-button-info-hover": "hover",
			"--dsw-alias-button-ghost-active-border": "borderStrong",
			"--dsw-alias-button-ghost-active-fill": "tint",
			"--dsw-alias-button-ghost-active-hover": "active",
			"--dsw-alias-button-tool-bar-fill": "tint",
			"--dsw-alias-button-tool-bar-hover": "active",
			"--dsw-alias-interactive-bg-hover": "tint",
			"--dsw-alias-interactive-bg-hover-solid": "tint",
			"--dsw-alias-interactive-bg-hover-accent": "tint",
			"--dsw-alias-interactive-bg-active": "active",
			"--dsw-alias-interactive-bg-hover-danger": "errorTint",
			"--dsw-alias-label-primary": "text",
			"--dsw-alias-label-primary-dimmed": "text",
			"--dsw-alias-label-primary-bluish": "text",
			"--dsw-alias-label-primary-foreground": "foreground",
			"--dsw-alias-label-primary-inverted": "foreground",
			"--dsw-alias-label-secondary": "secondary",
			"--dsw-alias-label-tertiary": "tertiary",
			"--dsw-alias-label-caption": "tertiary",
			"--dsw-alias-label-dimmed": "tertiary",
			"--dsw-alias-label-deep-diving": "accent",
			"--dsw-alias-label-deep-diving-shimmer": "hover",
			"--dsw-alias-menu-icon": "secondary",
			"--dsw-alias-link": "accent",
			"--dsw-alias-markdown-code-block": "code",
			"--dsw-alias-markdown-code-block-banner": "raised",
			"--dsw-alias-markdown-inline-code": "tint",
			"--dsw-alias-markdown-citation": "tint",
			"--dsw-alias-markdown-placeholder": "raised",
			"--dsw-alias-markdown-tag": "tint",
			"--dsw-alias-markdown-code-segment-selected": "panel",
			"--dsw-alias-markdown-code-segment-unselected": "raised",
			"--dsw-alias-scrollbar-bg-l1": "border",
			"--dsw-alias-scrollbar-bg-l2": "border",
			"--dsw-alias-scrollbar-hover-l1": "borderStrong",
			"--dsw-alias-scrollbar-hover-l2": "borderStrong",
			"--dsw-alias-state-business-primary": "accent",
			"--dsw-alias-state-business-tertiary": "tint",
			"--dsw-alias-state-error-primary": "error",
			"--dsw-alias-state-error-secondary": "error",
			"--dsw-alias-state-success-primary": "success",
			"--dsw-alias-state-success-secondary": "success",
			"--dsw-alias-state-success-tertiary": "successTint",
			"--dsw-alias-state-warn-primary": "warning",
			"--dsw-alias-state-warn-secondary": "warning",
			"--dsw-alias-state-warn-label": "warning",
			"--dsw-alias-state-warn-tertiary": "warningTint",
			"--dsw-alias-code-diff-added": "successTint",
			"--dsw-alias-code-diff-deleted": "errorTint",
			"--dsw-alias-file-diff-added-bg": "successTint",
			"--dsw-alias-file-diff-added-gutter": "successTint",
			"--dsw-alias-file-diff-added-marker": "success",
			"--dsw-alias-file-diff-deleted-bg": "errorTint",
			"--dsw-alias-file-diff-deleted-gutter": "errorTint",
			"--dsw-alias-file-diff-deleted-marker": "error",
			"--dsw-alias-switch-thumb": "foreground",
			"--dsw-alias-toast-bg": "toast",
			"--dsw-alias-toast-label": "toastText",
			"--dsw-alias-tooltip-bg": "toast",
			"--dsw-alias-tooltip-key-bg": "border",
			"--dsw-alias-turn-trigger-bg": "raised",
			"--dsw-alias-turn-trigger-bg-hover": "tint",
			"--dsw-specific-bubble": "bubble",
			"--dsw-specific-bubble-highlight": "active",
			"--dsw-specific-input-major": "panel",
			"--dsw-specific-login-input": "raised",
			"--dsw-menu-surface-fill": "overlay",
			"--dsw-alias-menu-group-header-fill": "overlay",
			"--dsw-specific-menu": "overlay",
			"--dsw-specific-selector": "raised",
			"--dsw-specific-sidebar-fill": "sidebar",
			"--dsw-specific-sidebar-nav-item-active-accent": "tint",
			"--dsw-specific-sidebar-nav-item-active": "tint",
			"--dsw-specific-sidebar-nav-item-hover": "raised",
			"--dsw-specific-tip": "raised",
			"--dsw-focus-ring-color": "accent",
			"--dsw-elevation-stroke-color": "border"
		}).map(([token, role]) => [token, { ...colors[role] }]));
		Object.fromEntries(Object.entries(themeOverrides).map(([name, value]) => [name, value.light])), Object.fromEntries(Object.entries(themeOverrides).map(([name, value]) => [name, value.dark]));
		//#endregion
		//#region src/client/presentation.ts
		/** Apply settings to the document and return a disposer for plugin unload. */
		function mountPresentation(api) {
			const root = document.documentElement;
			let live = true;
			let visible = true;
			let claimingIntro = false;
			let media;
			let mediaKey = "";
			const keys = [
				"astrology",
				"astrologySliderStyle",
				"astrologySliderMotion",
				"astrologyBackgroundFit"
			];
			const previous = keys.map((key) => root.dataset[key]);
			root.dataset.astrology = "";
			const layer = document.createElement("div");
			layer.id = "astrology-workspace-background-layer";
			layer.setAttribute("aria-hidden", "true");
			document.body.prepend(layer);
			const clearMedia = () => {
				if (media instanceof HTMLVideoElement) {
					media.pause();
					media.removeAttribute("src");
					media.load();
				}
				media = void 0;
				layer.replaceChildren();
			};
			const play = (video) => {
				video.play().catch((error) => {
					if (live && media === video) console.warn("Astrology background video did not start", error);
				});
			};
			const render = (view) => {
				if (!live) return;
				root.dataset.astrologySliderStyle = view.reasoningSliderStyle;
				root.dataset.astrologySliderMotion = String(view.reasoningSliderMotion);
				root.dataset.astrologyBackgroundFit = view.backgroundFit;
				const nextKey = JSON.stringify([view.backgroundMedia, view.backgroundURL]);
				if (nextKey === mediaKey) {
					if (media instanceof HTMLVideoElement) media.loop = view.backgroundLoop;
					return;
				}
				mediaKey = nextKey;
				clearMedia();
				if (view.backgroundURL === null || view.backgroundMedia === null) return;
				media = view.backgroundMedia === "png" || view.backgroundMedia === "jpg" || view.backgroundMedia === "webp" ? document.createElement("img") : document.createElement("video");
				media.className = "astrology-workspace-background";
				media.src = view.backgroundURL;
				if (media instanceof HTMLVideoElement) {
					media.autoplay = visible;
					media.muted = true;
					media.loop = view.backgroundLoop;
					media.playsInline = true;
				}
				const current = media;
				current.addEventListener("error", () => {
					if (live && media === current) clearMedia();
				}, { once: true });
				const scrim = document.createElement("div");
				scrim.className = "astrology-workspace-scrim";
				layer.replaceChildren(media, scrim);
				if (visible && media instanceof HTMLVideoElement) play(media);
			};
			const stopSettings = observePreferences(api, render, (error) => {
				console.warn("Astrology preferences are unavailable", error);
			});
			const showIntro = () => {
				if (!live || claimingIntro) return;
				claimingIntro = true;
				Promise.resolve().then(() => live ? api.claimIntro() : false).then((shouldShow) => live && shouldShow ? api.presentation(true) : void 0).catch((error) => {
					console.warn("Astrology intro could not be opened", error);
				}).finally(() => {
					claimingIntro = false;
				});
			};
			const stopShown = api.onShown(showIntro);
			const stopVisibility = api.onVisibility((value) => {
				if (!live) return;
				visible = value;
				if (media instanceof HTMLVideoElement) {
					if (visible) play(media);
					else media.pause();
				}
			});
			return () => {
				if (!live) return;
				live = false;
				stopSettings();
				stopShown();
				stopVisibility();
				api.presentation(false).catch((error) => {
					console.warn("Astrology intro could not be closed during unload", error);
				});
				clearMedia();
				layer.remove();
				keys.forEach((key, index) => {
					const value = previous[index];
					if (value === void 0) delete root.dataset[key];
					else root.dataset[key] = value;
				});
			};
		}
		//#endregion
		//#region src/client/stylesheet.ts
		/** Build placeholder replaced with the CSS bundle by scripts/embed-css.mjs. */
		const ASTROLOGY_CSS = "html[data-astrology] {\n  background: #100d18;\n}\n\nhtml[data-astrology] body {\n  --astrology-effort-accent: var(--dsw-alias-brand-primary);\n  --astrology-effort-duration: .12s;\n  --astrology-effort-surface: var(--dsw-alias-bg-layer-1);\n  --astrology-effort-pill: var(--dsw-alias-bg-layer-2);\n  --astrology-effort-pill-hover: var(--dsw-alias-interactive-bg-hover);\n  --astrology-effort-track: var(--dsw-alias-bg-multi-select);\n  --astrology-effort-secondary: var(--dsw-alias-label-secondary);\n  --astrology-effort-muted: var(--dsw-alias-label-tertiary);\n  --astrology-effort-thumb: color-mix(in srgb,var(--dsw-alias-brand-primary) 12%,white);\n}\n\nhtml[data-astrology][data-astrology-slider-style=\"stage\"] body {\n  --astrology-effort-accent: var(--dsw-alias-brand-primary);\n  --astrology-effort-value: #d8b56a;\n}\n\nhtml[data-astrology][data-astrology-slider-style=\"minimal\"] body {\n  --astrology-effort-accent: var(--dsw-alias-label-secondary);\n  --astrology-effort-highlight: var(--dsw-alias-label-secondary);\n}\n\nhtml[data-astrology][data-astrology-slider-motion=\"false\"] body {\n  --astrology-effort-duration: 0s;\n}\n\nhtml[data-astrology]:has(body:not([data-ds-dark-theme])) {\n  background: #f7f4fb;\n}\n\nhtml[data-astrology] body:has(#astrology-workspace-background-layer) {\n  isolation: isolate;\n  position: relative;\n}\n\n#astrology-workspace-background-layer {\n  z-index: 0;\n  pointer-events: none;\n  isolation: isolate;\n  position: fixed;\n  inset: 0;\n}\n\n.astrology-workspace-background, .astrology-workspace-scrim {\n  pointer-events: none;\n  width: 100%;\n  height: 100%;\n  position: absolute;\n  inset: 0;\n}\n\n.astrology-workspace-background {\n  z-index: 0;\n  object-fit: cover;\n}\n\n.astrology-workspace-background-failed {\n  display: none;\n}\n\nhtml[data-astrology] #root {\n  z-index: 1;\n  position: relative;\n}\n\n.astrology-workspace-scrim {\n  z-index: 1;\n  background: #0a071029;\n}\n\nhtml[data-astrology][data-astrology-background-fit=\"contain\"] .astrology-workspace-background {\n  object-fit: contain;\n}\n\nhtml[data-astrology] body:has(#astrology-workspace-background-layer) {\n  --astrology-glass-rgb: 250 250 254;\n  --astrology-glass-opacity: 76%;\n  --astrology-glass-line: #ffffff61;\n  --astrology-glass-shadow: 0 12px 36px #1814261f;\n  --astrology-glass-blur: blur(28px) saturate(1.08);\n  --astrology-glass-surface: color-mix(in srgb,rgb(var(--astrology-glass-rgb)) var(--astrology-glass-opacity),transparent);\n  --astrology-glass-control: rgb(var(--astrology-glass-rgb) / .38);\n  --astrology-glass-hover: color-mix(in srgb,var(--dsw-alias-brand-primary) 9%,rgb(var(--astrology-glass-rgb) / .32));\n  --astrology-glass-active: color-mix(in srgb,var(--dsw-alias-brand-primary) 16%,rgb(var(--astrology-glass-rgb) / .4));\n  --dsw-alias-bg-layer-1: var(--astrology-glass-control);\n  --dsw-alias-bg-layer-2: var(--astrology-glass-surface);\n  --dsw-alias-bg-layer-3: var(--astrology-glass-surface);\n  --dsw-alias-bg-overlay: var(--astrology-glass-surface);\n  --dsw-alias-bg-module-platform: var(--astrology-glass-surface);\n  --dsw-alias-bg-multi-select: var(--astrology-glass-active);\n  --dsw-specific-sidebar-fill: transparent;\n  --dsw-specific-input-major: rgb(var(--astrology-glass-rgb) / .52);\n  --dsw-specific-selector: var(--astrology-glass-control);\n  --dsw-menu-surface-fill: var(--astrology-glass-surface);\n  --dsw-specific-menu: var(--astrology-glass-surface);\n  --dsw-alias-menu-group-header-fill: var(--astrology-glass-surface);\n  --dsw-menu-backdrop-filter: var(--astrology-glass-blur);\n  --dsw-alias-button-elevated-fill: var(--astrology-glass-control);\n  --dsw-alias-button-floating-fill: var(--astrology-glass-control);\n  --dsw-alias-button-floating-hover: var(--astrology-glass-hover);\n  --dsw-alias-button-ghost-active-fill: var(--astrology-glass-active);\n  --dsw-alias-button-ghost-active-hover: var(--astrology-glass-hover);\n  --dsw-alias-button-tool-bar-fill: var(--astrology-glass-control);\n  --dsw-alias-button-tool-bar-hover: var(--astrology-glass-hover);\n  --dsw-alias-interactive-bg-hover: var(--astrology-glass-hover);\n  --dsw-alias-interactive-bg-hover-solid: var(--astrology-glass-hover);\n  --dsw-alias-interactive-bg-hover-accent: var(--astrology-glass-hover);\n  --dsw-alias-interactive-bg-active: var(--astrology-glass-active);\n  --dsw-specific-sidebar-nav-item-active-accent: var(--astrology-glass-active);\n  --dsw-specific-sidebar-nav-item-active: var(--astrology-glass-active);\n  --dsw-specific-sidebar-nav-item-hover: var(--astrology-glass-hover);\n  --dsw-alias-state-business-tertiary: var(--astrology-glass-active);\n  --dsw-alias-settings-card-fill: rgb(var(--astrology-glass-rgb) / .16);\n  --dsw-alias-border-l1: color-mix(in srgb,var(--dsw-alias-label-primary) 10%,transparent);\n  --dsw-alias-border-l2: color-mix(in srgb,var(--dsw-alias-label-primary) 12%,transparent);\n  --dsw-alias-border-l3: color-mix(in srgb,var(--dsw-alias-label-primary) 15%,transparent);\n  --dsw-alias-border-l4: color-mix(in srgb,var(--dsw-alias-label-primary) 20%,transparent);\n  --dsw-alias-button-ghost-active-border: var(--dsw-alias-border-l3);\n  --dsw-alias-settings-card-stroke: var(--dsw-alias-border-l2);\n  --dsw-elevation-stroke-color: var(--dsw-alias-border-l3);\n  --astrology-effort-surface: var(--astrology-glass-surface);\n  --astrology-effort-pill: var(--astrology-glass-control);\n  --astrology-effort-pill-hover: var(--astrology-glass-hover);\n  --astrology-effort-track: var(--astrology-glass-active);\n}\n\nhtml[data-astrology] body[data-ds-dark-theme]:has(#astrology-workspace-background-layer) {\n  --astrology-glass-rgb: 24 26 34;\n  --astrology-glass-opacity: 72%;\n  --astrology-glass-line: #ffffff17;\n  --astrology-glass-shadow: 0 12px 36px #0003;\n  --dsw-alias-label-secondary: #d3cfdf;\n  --dsw-alias-label-tertiary: #beb8cc;\n  --dsw-alias-label-caption: #beb8cc;\n}\n\nhtml[data-astrology] body:not([data-ds-dark-theme]) .astrology-workspace-scrim {\n  background: #f7f5fc7a;\n}\n\nhtml[data-astrology] body[data-ds-dark-theme] .astrology-workspace-scrim {\n  background: #0a0b115c;\n}\n\nhtml[data-astrology] #root [class*=\"frame\"]:has( > [class*=\"sidebarCol\"]) {\n  background: none;\n}\n\nhtml[data-astrology] #root [class*=\"centerCol\"] {\n  --dsw-alias-bg-base: transparent;\n  background: none;\n  border-left: 0;\n  border-radius: 0;\n}\n\nhtml[data-astrology] #root [class*=\"sidebarCol\"] {\n  isolation: isolate;\n  background: none;\n  border-right: 0;\n  position: relative;\n}\n\nhtml[data-astrology] #root [class*=\"sidebarCol\"]:before {\n  content: \"\";\n  z-index: -1;\n  pointer-events: none;\n  background: rgb(var(--astrology-glass-rgb) / .28);\n  -webkit-backdrop-filter: blur(22px) saturate(1.08);\n  position: absolute;\n  inset: 0;\n  mask-image: linear-gradient(to right, #000 65%, #0000);\n}\n\nhtml[data-astrology] #root [class*=\"regionArea\"] {\n  --dsw-alias-bg-base: transparent;\n}\n\nhtml[data-astrology] body:has(#astrology-workspace-background-layer) #root [class*=\"rightbarCol\"] {\n  --dsw-alias-bg-base: transparent;\n  background: none;\n}\n\nhtml[data-astrology] body:has(#astrology-workspace-background-layer) #root [data-sidebar-right-panel] :is([data-dockkit-pane], [data-dockkit-float]) {\n  isolation: isolate;\n  background: none;\n  border-radius: 0;\n}\n\nhtml[data-astrology] body:has(#astrology-workspace-background-layer) #root [data-sidebar-right-panel] [data-dockkit-pane] {\n  position: relative;\n}\n\nhtml[data-astrology] body:has(#astrology-workspace-background-layer) #root [data-sidebar-right-panel] :is([data-dockkit-pane], [data-dockkit-float]):before {\n  content: \"\";\n  z-index: -1;\n  pointer-events: none;\n  background: var(--astrology-glass-control);\n  -webkit-backdrop-filter: var(--astrology-glass-blur);\n  position: absolute;\n  inset: 0;\n}\n\nhtml[data-astrology] body:has(#astrology-workspace-background-layer) #root [data-sidebar-right-panel] [data-dockkit-float] {\n  border-radius: var(--dsw-radius-panel);\n}\n\nhtml[data-astrology] body:has(#astrology-workspace-background-layer) #root [data-sidebar-right-panel] [data-dockkit-float]:before {\n  background: var(--astrology-glass-surface);\n}\n\nhtml[data-astrology][data-windows-titlebar] body:has(#astrology-workspace-background-layer):after {\n  content: \"\";\n  z-index: 0;\n  height: var(--dsh-windows-titlebar-height, 40px);\n  pointer-events: none;\n  background: rgb(var(--astrology-glass-rgb) / .18);\n  -webkit-backdrop-filter: blur(22px) saturate(1.08);\n  position: fixed;\n  inset: 0 0 auto;\n}\n\nhtml[data-astrology][data-windows-titlebar] #root [class*=\"frame\"]:has( > [class*=\"sidebarCol\"]):before {\n  background: none;\n}\n\nhtml[data-astrology] #root [class*=\"newSession\"]:is(button):not(:disabled) {\n  -webkit-backdrop-filter: blur(16px);\n  box-shadow: inset 0 1px 0 var(--astrology-glass-line);\n}\n\nhtml[data-astrology] #root [data-composer-card] {\n  -webkit-backdrop-filter: blur(22px) saturate(1.08);\n  box-shadow: var(--dsw-elevation-soft),inset 0 1px 0 var(--astrology-glass-line);\n}\n\nhtml[data-astrology] body:has(#astrology-workspace-background-layer) [role=\"dialog\"][aria-modal=\"true\"] {\n  background: var(--astrology-glass-surface);\n  -webkit-backdrop-filter: var(--astrology-glass-blur);\n  box-shadow: var(--astrology-glass-shadow),inset 0 0 0 1px var(--astrology-glass-line);\n}\n\nhtml[data-astrology] body:has(#astrology-workspace-background-layer) [data-menu-material] {\n  box-shadow: var(--astrology-glass-shadow),inset 0 0 0 1px var(--astrology-glass-line);\n}\n\nhtml[data-astrology] body:has(#astrology-workspace-background-layer) [data-effort-slider] {\n  box-shadow: none;\n  background: none;\n}\n\nhtml[data-astrology] body:has(#astrology-workspace-background-layer) [data-menu-material][data-effort-compact] {\n  background: none;\n}\n\n@media (prefers-reduced-transparency: reduce) {\n  html[data-astrology] body:has(#astrology-workspace-background-layer) {\n    --astrology-glass-opacity: 100%;\n    --astrology-glass-control: rgb(var(--astrology-glass-rgb));\n    --dsw-specific-input-major: rgb(var(--astrology-glass-rgb));\n    --dsw-alias-settings-card-fill: rgb(var(--astrology-glass-rgb));\n    --astrology-glass-blur: none;\n    --astrology-effort-surface: var(--astrology-glass-surface);\n  }\n\n  html[data-astrology] #root [class*=\"sidebarCol\"]:before {\n    background: rgb(var(--astrology-glass-rgb));\n    -webkit-backdrop-filter: none;\n    mask-image: none;\n  }\n\n  html[data-astrology] #root [data-composer-card], html[data-astrology] #root [class*=\"newSession\"]:is(button) {\n    -webkit-backdrop-filter: none;\n  }\n\n  html[data-astrology][data-windows-titlebar] body:has(#astrology-workspace-background-layer):after {\n    background: rgb(var(--astrology-glass-rgb));\n    -webkit-backdrop-filter: none;\n  }\n}\n\n.astrology-intro {\n  color: #f4effa;\n  background: #100d18;\n  border: 0;\n  width: 100vw;\n  max-width: none;\n  height: 100vh;\n  max-height: none;\n  padding: 0;\n  font: 13px / 1.6 Segoe UI, Microsoft YaHei, sans-serif;\n  overflow: hidden;\n}\n\n.astrology-intro::backdrop {\n  background: #100d18;\n}\n\n.astrology-intro [hidden] {\n  display: none !important;\n}\n\n.astrology-stage {\n  background: radial-gradient(at 65% 30%, #4c2d7155, #0000 55%), radial-gradient(at 25% 75%, #47324b66, #0000 60%), #100d18;\n  position: absolute;\n  inset: 0;\n}\n\n.astrology-stage video {\n  object-fit: cover;\n  background: #050307;\n  width: 100%;\n  height: 100%;\n  position: absolute;\n  inset: 0;\n}\n\n.astrology-intro[data-phase=\"video\"] .glow, .astrology-intro[data-phase=\"video\"] .cursor {\n  display: none;\n}\n\n.astrology-stage .glow {\n  pointer-events: none;\n  transform: translate(var(--px, 0px),var(--py, 0px));\n  background: linear-gradient(115deg, #0000 25%, #b59aea0c 30%, #0000 35% 65%, #d8b56a0c 70%, #0000 75%);\n  position: absolute;\n  inset: -12px;\n}\n\n.astrology-stage .cursor {\n  pointer-events: none;\n  background: radial-gradient(circle, #d5bcff12, #0000 65%);\n  width: 300px;\n  height: 300px;\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n}\n\n.astrology-intro .brand {\n  pointer-events: none;\n  flex-direction: column;\n  justify-content: center;\n  align-items: center;\n  display: flex;\n  position: absolute;\n  inset: 0;\n}\n\n.astrology-logo {\n  filter: drop-shadow(0 0 24px #a78bfa25);\n  width: clamp(140px, 24vh, 240px);\n  height: clamp(140px, 24vh, 240px);\n  margin-bottom: 16px;\n  overflow: visible;\n}\n\n.astrology-intro h1 {\n  letter-spacing: 18px;\n  text-indent: 18px;\n  margin: 0 0 18px;\n  font-size: clamp(36px, 5vw, 64px);\n  font-weight: 400;\n  line-height: 1.2;\n}\n\n.astrology-intro .english {\n  letter-spacing: 10px;\n  text-indent: 10px;\n  color: #d8b56a;\n  font-size: 12px;\n}\n\n.astrology-intro .caption {\n  color: #c4b5d5;\n  letter-spacing: 3px;\n  margin-top: 26px;\n  font-size: 12px;\n}\n\n.astrology-intro .ripple {\n  pointer-events: none;\n  border: 1px solid #d8b56a;\n  border-radius: 50%;\n  width: 12px;\n  height: 12px;\n  animation: .6s ease-out forwards astrology-ripple;\n  position: absolute;\n}\n\n.astrology-intro[data-phase=\"logo\"] .logo-orbits ellipse {\n  stroke-dasharray: 1;\n  stroke-dashoffset: 1px;\n  animation: 1.4s cubic-bezier(.22, .7, .3, 1) .1s forwards astrology-orbit;\n}\n\n.astrology-intro[data-phase=\"logo\"] .logo-orbits ellipse + ellipse {\n  opacity: .45;\n  animation-delay: .25s;\n}\n\n.astrology-intro[data-phase=\"logo\"] .logo-whale {\n  transform-origin: 120px 120px;\n  animation: 1.1s cubic-bezier(.22, .7, .3, 1) both astrology-whale;\n}\n\n.astrology-intro[data-phase=\"logo\"] .logo-stars {\n  transform-origin: 120px 120px;\n  animation: 1.4s ease-out .4s both astrology-stars;\n}\n\n.astrology-intro[data-phase=\"logo\"] h1 {\n  animation: .8s ease-out .3s both astrology-name;\n}\n\n.astrology-intro[data-phase=\"logo\"] .english {\n  animation: .8s ease-out .55s both astrology-name;\n}\n\n.astrology-intro[data-phase=\"logo\"] .caption {\n  animation: .8s ease-out .85s both astrology-name;\n}\n\n.astrology-stage[data-paused=\"true\"] * {\n  animation-play-state: paused !important;\n}\n\n@keyframes astrology-orbit {\n  to {\n    stroke-dashoffset: 0;\n  }\n}\n\n@keyframes astrology-whale {\n  from {\n    opacity: 0;\n    transform: translateY(16px) scale(.88);\n  }\n\n  to {\n    opacity: 1;\n    transform: translateY(0) scale(1);\n  }\n}\n\n@keyframes astrology-stars {\n  0% {\n    opacity: 0;\n    transform: scale(.75);\n  }\n\n  60% {\n    opacity: 1;\n    transform: scale(1.06);\n  }\n\n  100% {\n    opacity: 1;\n    transform: scale(1);\n  }\n}\n\n@keyframes astrology-name {\n  from {\n    opacity: 0;\n    transform: translateY(8px);\n  }\n\n  to {\n    opacity: 1;\n    transform: translateY(0);\n  }\n}\n\n@keyframes astrology-ripple {\n  to {\n    opacity: 0;\n    transform: translate(-50%, -50%) scale(9);\n  }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .astrology-stage .cursor, .astrology-stage .glow, .astrology-stage .ripple {\n    display: none;\n  }\n\n  .astrology-intro[data-phase=\"logo\"] * {\n    animation: none !important;\n  }\n\n  .astrology-intro[data-phase=\"logo\"] .logo-orbits ellipse {\n    stroke-dashoffset: 0;\n  }\n}\n.tM8Epq_brand {\n  text-align: left;\n  flex-direction: column;\n  flex: none;\n  gap: 1px;\n  max-width: 160px;\n  height: 24px;\n  display: flex;\n  overflow: hidden;\n}\n\n.tM8Epq_brand > span {\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  letter-spacing: 4px;\n  color: var(--dsw-alias-label-primary);\n  font-size: 15px;\n  font-weight: 600;\n  line-height: 16px;\n  overflow: hidden;\n}\n\n.tM8Epq_brand > small {\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  letter-spacing: 1.8px;\n  color: var(--dsw-alias-brand-primary);\n  font-size: 7px;\n  line-height: 7px;\n  overflow: hidden;\n}\n\n.tM8Epq_settings {\n  box-sizing: border-box;\n  width: min(100%, 680px);\n  color: var(--dsw-alias-label-primary);\n  padding: 4px 0 28px;\n}\n\n.tM8Epq_pageHeader {\n  margin-bottom: 24px;\n}\n\n.tM8Epq_pageHeader h2 {\n  letter-spacing: -.2px;\n  margin: 0 0 7px;\n  font-size: 22px;\n  font-weight: 650;\n  line-height: 1.35;\n}\n\n.tM8Epq_pageHeader p, .tM8Epq_groupHeader p {\n  color: var(--dsw-alias-label-secondary);\n  margin: 0;\n  font-size: 13px;\n  line-height: 1.65;\n}\n\n.tM8Epq_loading {\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 13px;\n}\n\n.tM8Epq_group {\n  margin-top: 24px;\n}\n\n.tM8Epq_groupHeader {\n  margin: 0 0 10px;\n}\n\n.tM8Epq_groupHeader h3 {\n  color: var(--dsw-alias-label-primary);\n  margin: 0 0 4px;\n  font-size: 15px;\n  font-weight: 600;\n  line-height: 1.45;\n}\n\n.tM8Epq_groupHeader p {\n  max-width: 620px;\n}\n\n.tM8Epq_card {\n  border: 1px solid color-mix(in srgb,var(--dsw-alias-border-l3) 48%,transparent);\n  border-radius: var(--dsw-radius-lg);\n  background: color-mix(in srgb,var(--dsw-alias-bg-layer-1) 34%,transparent);\n  -webkit-backdrop-filter: blur(16px) saturate(1.08);\n  min-width: 0;\n  margin: 0;\n  padding: 4px 16px;\n  display: block;\n  box-shadow: inset 0 1px #ffffff09;\n}\n\n.tM8Epq_card:disabled {\n  opacity: .72;\n}\n\n.tM8Epq_row {\n  min-height: 52px;\n  color: var(--dsw-alias-label-primary);\n  cursor: pointer;\n  justify-content: space-between;\n  align-items: center;\n  gap: 24px;\n  font-size: 14px;\n  display: flex;\n}\n\n.tM8Epq_row + .tM8Epq_row {\n  border-top: 1px solid var(--dsw-alias-border-l3);\n}\n\n.tM8Epq_row input[type=\"checkbox\"] {\n  width: 18px;\n  height: 18px;\n  accent-color: var(--dsw-alias-brand-primary);\n  cursor: pointer;\n  flex: none;\n}\n\n.tM8Epq_textInput, .tM8Epq_row select {\n  box-sizing: border-box;\n  border: 1px solid color-mix(in srgb,var(--dsw-alias-border-l3) 58%,transparent);\n  min-width: 150px;\n  max-width: 60%;\n  min-height: 36px;\n  color: var(--dsw-alias-label-primary);\n  background: color-mix(in srgb,var(--dsw-alias-bg-layer-2) 38%,transparent);\n  font: inherit;\n  border-radius: 999px;\n  padding: 0 12px;\n}\n\n.tM8Epq_row select {\n  cursor: pointer;\n  min-width: 175px;\n}\n\n.tM8Epq_textInput {\n  width: min(55%, 280px);\n}\n\n.tM8Epq_cardFooter {\n  border-top: 1px solid var(--dsw-alias-border-l3);\n  justify-content: space-between;\n  align-items: center;\n  gap: 16px;\n  min-height: 56px;\n  padding: 8px 0;\n  display: flex;\n}\n\n.tM8Epq_helper {\n  min-width: 0;\n  color: var(--dsw-alias-label-secondary);\n  font-size: 12px;\n  line-height: 1.55;\n}\n\n.tM8Epq_inlineNote {\n  color: var(--dsw-alias-label-tertiary);\n  margin: 0;\n  padding: 10px 0 12px;\n  font-size: 12px;\n  line-height: 1.55;\n}\n\n.tM8Epq_buttonGroup {\n  flex-wrap: wrap;\n  flex: none;\n  gap: 8px;\n  display: flex;\n}\n\n.tM8Epq_primaryButton, .tM8Epq_secondaryButton {\n  box-sizing: border-box;\n  border: 1px solid color-mix(in srgb,var(--dsw-alias-border-l3) 58%,transparent);\n  min-height: 36px;\n  color: var(--dsw-alias-label-primary);\n  background: color-mix(in srgb,var(--dsw-alias-bg-layer-2) 38%,transparent);\n  font: inherit;\n  cursor: pointer;\n  border-radius: 999px;\n  padding: 0 16px;\n  font-size: 13px;\n  transition: background-color .12s, border-color .12s, transform .12s;\n}\n\n.tM8Epq_primaryButton {\n  border-color: color-mix(in srgb,var(--dsw-alias-brand-primary) 72%,transparent);\n  color: var(--dsw-static-neutral-bluish-00);\n  background: color-mix(in srgb,var(--dsw-alias-brand-primary) 82%,transparent);\n}\n\nbody[data-ds-dark-theme] .tM8Epq_primaryButton {\n  color: var(--dsw-static-neutral-bluish-1000);\n}\n\n.tM8Epq_primaryButton:hover:not(:disabled) {\n  filter: brightness(1.06);\n}\n\n.tM8Epq_secondaryButton:hover:not(:disabled) {\n  background: var(--dsw-alias-interactive-bg-hover);\n}\n\n.tM8Epq_primaryButton:active:not(:disabled), .tM8Epq_secondaryButton:active:not(:disabled) {\n  transform: translateY(1px);\n}\n\n.tM8Epq_primaryButton:disabled, .tM8Epq_secondaryButton:disabled {\n  opacity: .48;\n  cursor: default;\n}\n\n.tM8Epq_settings :focus-visible {\n  outline: 2px solid var(--dsw-alias-brand-primary);\n  outline-offset: 3px;\n}\n\n.tM8Epq_status {\n  min-height: 22px;\n  color: var(--dsw-alias-label-secondary);\n  margin: 12px 0 0;\n  font-size: 12px;\n}\n\n.tM8Epq_settings .tM8Epq_status:empty {\n  min-height: 0;\n  margin-top: 0;\n}\n\n@media (width <= 560px) {\n  .tM8Epq_card {\n    padding: 3px 12px;\n  }\n\n  .tM8Epq_row {\n    gap: 12px;\n  }\n\n  .tM8Epq_row select {\n    min-width: 145px;\n  }\n\n  .tM8Epq_cardFooter {\n    flex-direction: column;\n    justify-content: center;\n    align-items: flex-start;\n  }\n\n  .tM8Epq_buttonGroup {\n    width: 100%;\n  }\n}\n";
		/** Settings and compatibility styles also belong to clients without Desktop support. */
		function mountStylesheet() {
			const style = document.createElement("style");
			style.dataset.plugin = "dsh-plugin-astrology";
			style.dataset.pluginCss = "@dsh-external/dsh-plugin-astrology";
			style.textContent = ASTROLOGY_CSS;
			document.head.append(style);
			return () => style.remove();
		}
		//#endregion
		//#region src/client/astrology/host-api.ts
		/** Check the complete bridge before installing any native-dependent UI. */
		function isAstrologyCarrier(value) {
			if (typeof value !== "object" || value === null) return false;
			const candidate = value;
			return candidate.apiVersion === 1 && [
				"state",
				"onSettings",
				"claimIntro",
				"presentation",
				"toggleFullscreen",
				"onShown",
				"onVisibility",
				"configure",
				"chooseVideo",
				"chooseBackground"
			].every((key) => typeof candidate[key] === "function");
		}
		//#endregion
		//#region src/client/index.ts
		/** Services required by the client-owned theme and settings contributions. */
		const inject = [
			"locale",
			"slots",
			"theme"
		];
		const NS = "brand.astrology";
		/** Register theme, brand and settings only when the versioned Desktop bridge is available. */
		function apply(ctx) {
			ctx.effect(() => ctx.theme.overrideTokens("dsh-plugin-astrology", themeOverrides), "Astrology theme tokens");
			ctx.effect(mountStylesheet, "Astrology stylesheet");
			const api = window.dshAstrology;
			if (!isAstrologyCarrier(api)) {
				ctx.effect(() => ctx.locale.register(NS, {
					zh,
					en
				}), "Astrology compatibility copy");
				const t = ctx.locale.bind(NS);
				ctx.slots.inject("settings.section", () => ctx.slots.register({
					name: "settings.section",
					id: "astrology",
					order: 12,
					label: () => t("nav"),
					locale: NS
				}, AstrologyUnsupported));
				return;
			}
			ctx.plugin({
				inject: ["locale", "slots"],
				apply: (child) => mountAstrology(child, api)
			});
			ctx.effect(() => mountPresentation(api), "Astrology Desktop presentation");
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return exports;
	}
});
