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
				clearVideo: api.clearVideo ? () => run(() => api.clearVideo()) : void 0,
				chooseBackground: () => run(() => api.chooseBackground()),
				clearBackground: api.clearBackground ? () => run(() => api.clearBackground()) : void 0,
				preview: () => run(() => api.presentation(true), "preview")
			};
		}
		//#endregion
		//#region src/client/astrology/Astrology.tsx
		/** Native branding and feature-owned settings, rendered through the existing slots. */
		/** @returns Two-line personal brand. */
		function AstrologyBrandName({ useStore }) {
			const chinese = useStore((state) => state.chinese);
			const english = useStore((state) => state.english);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				className: "dsh-astrology-brand",
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
		function AstrologySettings({ api, native, close, t }) {
			const controller = (0, react.useMemo)(() => createSettingsController(api), [api]);
			const { view, draft, busy, loading, notice } = (0, react.useSyncExternalStore)(controller.subscribe, controller.getSnapshot);
			(0, react.useEffect)(() => controller.start(), [controller]);
			const brandChanged = view !== void 0 && (draft.chinese !== view.brandChinese || draft.english !== view.brandEnglish);
			const backgroundLabel = view?.backgroundMedia === null || view?.backgroundMedia === void 0 ? t("backgroundDefault") : view.backgroundMedia === "mp4" ? t("backgroundMp4") : view.backgroundMedia === "webm" ? t("backgroundWebm") : view.backgroundMedia === "png" ? t("backgroundPng") : view.backgroundMedia === "jpg" ? t("backgroundJpg") : t("backgroundWebp");
			function updatePreference(key, value) {
				controller.configure({ [key]: value });
			}
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: "dsh-astrology-settings",
				"aria-label": t("title"),
				"aria-busy": busy || loading,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
						className: "dsh-astrology-pageHeader",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: t("title") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t(native ? "description" : "rendererDescription") })]
					}),
					loading && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "dsh-astrology-loading",
						role: "status",
						children: t("loading")
					}),
					notice === "loadFailure" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-astrology-cardFooter",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							role: "alert",
							children: t("loadFailure")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dsh-astrology-secondaryButton",
							disabled: loading || busy,
							onClick: () => {
								controller.refresh();
							},
							children: t("retry")
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: "dsh-astrology-group",
						"aria-labelledby": "astrology-brand-heading",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
							className: "dsh-astrology-groupHeader",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
								id: "astrology-brand-heading",
								children: t("brandSection")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("brandDescription") })]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("fieldset", {
							className: "dsh-astrology-card",
							disabled: busy || !view,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: "dsh-astrology-row",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("brandChinese") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										className: "dsh-astrology-textInput",
										maxLength: 24,
										value: draft.chinese,
										onChange: (event) => controller.editBrand("chinese", event.target.value.slice(0, 24))
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: "dsh-astrology-row",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("brandEnglish") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										className: "dsh-astrology-textInput",
										maxLength: 32,
										value: draft.english,
										onChange: (event) => controller.editBrand("english", event.target.value.slice(0, 32))
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "dsh-astrology-cardFooter",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dsh-astrology-helper",
										children: t("brandScope")
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										className: "dsh-astrology-primaryButton",
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
						className: "dsh-astrology-group",
						"aria-labelledby": "astrology-background-heading",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
							className: "dsh-astrology-groupHeader",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
								id: "astrology-background-heading",
								children: t("backgroundSection")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("backgroundDescription") })]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("fieldset", {
							className: "dsh-astrology-card",
							disabled: busy || !view,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: "dsh-astrology-row",
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
									className: "dsh-astrology-row",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("backgroundLoop") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: view?.backgroundLoop !== false,
										disabled: view?.backgroundMedia === "png" || view?.backgroundMedia === "jpg" || view?.backgroundMedia === "webp",
										onChange: (event) => updatePreference("backgroundLoop", event.target.checked)
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "dsh-astrology-cardFooter",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dsh-astrology-helper",
										children: backgroundLabel
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "dsh-astrology-buttonGroup",
										children: [controller.clearBackground && view?.backgroundMedia && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: "dsh-astrology-secondaryButton",
											disabled: busy,
											onClick: () => {
												controller.clearBackground?.();
											},
											children: t("clearBackground")
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: "dsh-astrology-secondaryButton",
											disabled: busy || !view,
											onClick: () => {
												controller.chooseBackground();
											},
											children: t("chooseBackground")
										})]
									})]
								}),
								(view?.backgroundMedia === "png" || view?.backgroundMedia === "jpg" || view?.backgroundMedia === "webp") && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: "dsh-astrology-inlineNote",
									children: t("imageLoopNote")
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: "dsh-astrology-group",
						"aria-labelledby": "astrology-intro-heading",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
							className: "dsh-astrology-groupHeader",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
								id: "astrology-intro-heading",
								children: t("introSection")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t(native ? "introDescription" : "workspaceIntroDescription") })]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("fieldset", {
							className: "dsh-astrology-card",
							disabled: busy || !view,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: "dsh-astrology-row",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("intro") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: view?.introEnabled === true,
										onChange: (event) => updatePreference("introEnabled", event.target.checked)
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: "dsh-astrology-row",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("sound") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: view?.videoSound === true,
										onChange: (event) => updatePreference("videoSound", event.target.checked)
									})]
								}),
								native && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: "dsh-astrology-row",
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
									className: "dsh-astrology-row",
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
									className: "dsh-astrology-cardFooter",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dsh-astrology-helper",
										children: t(view?.media ? "introVideo" : "introDefault")
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "dsh-astrology-buttonGroup",
										children: [
											controller.clearVideo && view?.media && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
												type: "button",
												className: "dsh-astrology-secondaryButton",
												disabled: busy,
												onClick: () => {
													controller.clearVideo?.();
												},
												children: t("clearVideo")
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
												type: "button",
												className: "dsh-astrology-secondaryButton",
												disabled: busy || !view,
												onClick: () => {
													controller.chooseVideo();
												},
												children: t("chooseVideo")
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
												type: "button",
												className: "dsh-astrology-secondaryButton",
												disabled: busy || !view,
												onClick: () => {
													controller.preview().then((opened) => {
														if (opened && native) close();
													});
												},
												children: t("preview")
											})
										]
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: "dsh-astrology-inlineNote",
									children: t(native ? "introSequence" : "workspaceIntroSequence")
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: "dsh-astrology-group",
						"aria-labelledby": "astrology-slider-heading",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
							className: "dsh-astrology-groupHeader",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
								id: "astrology-slider-heading",
								children: t("sliderSection")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("sliderNote") })]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("fieldset", {
							className: "dsh-astrology-card",
							disabled: busy || !view,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								className: "dsh-astrology-row",
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
								className: "dsh-astrology-row",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("sliderMotion") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: view?.reasoningSliderMotion !== false,
									onChange: (event) => updatePreference("reasoningSliderMotion", event.target.checked)
								})]
							})]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: "dsh-astrology-group",
						"aria-labelledby": "astrology-companion-heading",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
							className: "dsh-astrology-groupHeader",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
								id: "astrology-companion-heading",
								children: t("companionSection")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("companionDescription") })]
						}), native ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("fieldset", {
							className: "dsh-astrology-card",
							disabled: busy || !view,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								className: "dsh-astrology-row",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("pet") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: view?.petEnabled === true,
									onChange: (event) => updatePreference("petEnabled", event.target.checked)
								})]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: "dsh-astrology-inlineNote",
								children: t("companionHelp")
							})]
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "dsh-astrology-inlineNote",
							children: t("windowsPetHelp")
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "dsh-astrology-status",
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
			rendererDescription: "主题已启用。可修改侧栏名称及工作区背景，设置和媒体保存在当前应用的数据中。",
			workspaceIntroDescription: "工作区加载时播放星术动画或你选择的视频。",
			workspaceIntroSequence: "片头在应用窗口内播放。按 Esc 或点击「跳过片头」返回工作区。",
			clearVideo: "移除片头视频",
			windowsPetHelp: "官方 Windows 版可通过星术插件的 desktopPet 配置启动独立的桌面伙伴。操作见插件 README。",
			clearBackground: "移除背景"
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
			rendererDescription: "The theme is active. Customize the sidebar name and workspace background. Preferences and media are stored in this app.",
			workspaceIntroDescription: "Play the Astrology animation or an imported video when the workspace loads.",
			workspaceIntroSequence: "The intro plays inside the app window. Press Esc or select Skip intro to return to the workspace.",
			clearVideo: "Remove intro video",
			windowsPetHelp: "On stock Windows Desktop, enable the separate companion using the plugin’s desktopPet setting. See the plugin README.",
			clearBackground: "Remove background"
		};
		/** @param ctx Child context with locale and slot services. @param api Restricted native carrier. */
		function mountAstrology(ctx, api, native) {
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
			ctx.slots.inject("sidebar.brand.mark", () => ctx.slots.register({
				name: "sidebar.brand.mark",
				priority: -10
			}, AstrologyBrandMark));
			ctx.slots.inject("sidebar.brand.name", () => ctx.slots.register({
				name: "sidebar.brand.name",
				priority: -10,
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
				inject: () => ({
					api,
					native
				})
			}, AstrologySettings));
		}
		//#endregion
		//#region src/client/astrology/intro.ts
		/** A stock-host intro lives in the workspace's top layer and always has an escape. */
		function showWorkspaceIntro(view) {
			const dialog = document.createElement("dialog");
			dialog.className = "dsh-astrology-intro";
			dialog.setAttribute("aria-label", "Astrology");
			const logo = document.createElement("div");
			logo.className = "dsh-astrology-introLogo";
			logo.textContent = "✦ ASTROLOGY";
			const skip = document.createElement("button");
			skip.type = "button";
			skip.textContent = document.documentElement.lang.startsWith("zh") ? "跳过片头" : "Skip intro";
			skip.autofocus = true;
			dialog.append(logo, skip);
			const video = view.mediaURL ? document.createElement("video") : void 0;
			let deadline;
			const stopVideo = () => {
				if (!video?.isConnected) return;
				video.pause();
				video.removeAttribute("src");
				video.load();
				video.remove();
			};
			const close = () => {
				clearTimeout(deadline);
				stopVideo();
				if (dialog.open) dialog.close();
				dialog.remove();
			};
			const showLogo = () => {
				stopVideo();
				logo.hidden = false;
				clearTimeout(deadline);
				deadline = setTimeout(close, 2300);
			};
			skip.addEventListener("click", close);
			dialog.addEventListener("cancel", (event) => {
				event.preventDefault();
				close();
			});
			document.body.append(dialog);
			try {
				dialog.showModal();
			} catch (error) {
				close();
				throw error;
			}
			if (video && view.mediaURL) {
				logo.hidden = true;
				video.playsInline = true;
				video.muted = !view.videoSound;
				video.style.objectFit = view.videoFit;
				video.src = view.mediaURL;
				video.addEventListener("error", showLogo, { once: true });
				video.addEventListener("ended", showLogo, { once: true });
				dialog.prepend(video);
				deadline = setTimeout(showLogo, 6e4);
				video.play().catch(() => {
					if (video.isConnected) showLogo();
				});
			} else showLogo();
			return close;
		}
		//#endregion
		//#region src/client/astrology/renderer-api.ts
		const key = "dsh-plugin-astrology.preferences.v1";
		const formats = /* @__PURE__ */ new Map([
			["image/png", "png"],
			["image/jpeg", "jpg"],
			["image/webp", "webp"],
			["video/mp4", "mp4"],
			["video/webm", "webm"]
		]);
		const defaults = {
			brandChinese: "星术",
			brandEnglish: "ASTROLOGY",
			backgroundFit: "cover",
			backgroundLoop: true,
			backgroundMedia: null,
			backgroundURL: null,
			introEnabled: false,
			playFull: false,
			videoSound: false,
			startupDisplay: "window",
			videoFit: "contain",
			reasoningSliderStyle: "codex",
			reasoningSliderMotion: true,
			petEnabled: false,
			media: null,
			mediaURL: null
		};
		/** Stock Desktop mode uses only the renderer's own storage and standard file picker. */
		function createRendererAstrology() {
			let view = { ...defaults };
			let initial;
			let database;
			let disposed = false;
			let cancelPicker;
			let closeIntro;
			let introClaimed = false;
			let presentationGeneration = 0;
			const listeners = /* @__PURE__ */ new Set();
			const publish = () => {
				for (const listener of listeners) listener(view);
				return view;
			};
			const open = () => database ??= new Promise((resolve, reject) => {
				const request = indexedDB.open("dsh-plugin-astrology", 1);
				request.onupgradeneeded = () => request.result.createObjectStore("media");
				request.onsuccess = () => resolve(request.result);
				request.onerror = () => reject(request.error);
			}).catch((error) => {
				database = void 0;
				throw error;
			});
			async function mediaStorage(mode, operation) {
				const db = await open();
				if (disposed) throw Error("Astrology was unloaded");
				return new Promise((resolve, reject) => {
					const transaction = db.transaction("media", mode);
					const request = operation(transaction.objectStore("media"));
					transaction.oncomplete = () => resolve(request.result);
					transaction.onabort = () => reject(transaction.error);
				});
			}
			function setMedia(blob) {
				const format = blob && formats.get(blob.type);
				const previous = view.backgroundURL;
				view = {
					...view,
					backgroundMedia: format || null,
					backgroundURL: format ? URL.createObjectURL(blob) : null
				};
				if (previous) URL.revokeObjectURL(previous);
				return view;
			}
			function setIntro(blob) {
				const previous = view.mediaURL;
				const media = blob?.type === "video/mp4" ? "mp4" : blob?.type === "video/webm" ? "webm" : null;
				view = {
					...view,
					media,
					mediaURL: media && blob ? URL.createObjectURL(blob) : null
				};
				if (previous) URL.revokeObjectURL(previous);
			}
			const state = async () => {
				initial ??= (async () => {
					let saved = null;
					try {
						saved = JSON.parse(localStorage.getItem(key) ?? "null");
					} catch {}
					if (saved) {
						if (typeof saved.brandChinese === "string" && saved.brandChinese.trim()) view.brandChinese = saved.brandChinese.slice(0, 24);
						if (typeof saved.brandEnglish === "string") view.brandEnglish = saved.brandEnglish.slice(0, 32);
						if (saved.backgroundFit === "contain") view.backgroundFit = "contain";
						if (saved.backgroundLoop === false) view.backgroundLoop = false;
						view.introEnabled = saved.introEnabled === true;
						view.videoSound = saved.videoSound === true;
						if (saved.videoFit === "cover") view.videoFit = "cover";
						if (saved.reasoningSliderStyle === "stage" || saved.reasoningSliderStyle === "minimal") view.reasoningSliderStyle = saved.reasoningSliderStyle;
						view.reasoningSliderMotion = saved.reasoningSliderMotion !== false;
					}
					const [media, intro] = await Promise.all(["background", "intro"].map((name) => mediaStorage("readonly", (store) => store.get(name)).catch(() => void 0)));
					if (!disposed && media instanceof Blob) setMedia(media);
					if (!disposed && intro instanceof Blob) setIntro(intro);
				})();
				await initial;
				return view;
			};
			function pick(accept) {
				return new Promise((resolve, reject) => {
					const input = document.createElement("input");
					input.type = "file";
					input.accept = accept;
					input.hidden = true;
					document.body.append(input);
					const finish = (file) => {
						input.remove();
						cancelPicker = void 0;
						resolve(file);
					};
					cancelPicker = () => finish();
					input.addEventListener("change", () => finish(input.files?.[0]), { once: true });
					input.addEventListener("cancel", cancelPicker, { once: true });
					try {
						input.click();
					} catch (error) {
						input.remove();
						cancelPicker = void 0;
						reject(error);
					}
				});
			}
			return {
				api: {
					state,
					onSettings(listener) {
						listeners.add(listener);
						return () => {
							listeners.delete(listener);
						};
					},
					async configure(changes) {
						await state();
						if (disposed) throw Error("Astrology was unloaded");
						const { brandChinese, brandEnglish, backgroundFit, backgroundLoop, introEnabled, videoSound, videoFit, reasoningSliderStyle, reasoningSliderMotion } = {
							...view,
							...changes
						};
						const preferences = {
							brandChinese: brandChinese.trim().slice(0, 24) || defaults.brandChinese,
							brandEnglish: brandEnglish.trim().slice(0, 32),
							backgroundFit,
							backgroundLoop,
							introEnabled,
							videoSound,
							videoFit,
							reasoningSliderStyle,
							reasoningSliderMotion
						};
						localStorage.setItem(key, JSON.stringify(preferences));
						view = {
							...view,
							...preferences
						};
						return publish();
					},
					async chooseBackground() {
						const file = await pick([...formats.keys()].join(","));
						if (!file || disposed) return view;
						if (!formats.has(file.type) || file.size === 0 || file.size > 134217728) throw Error("Unsupported background file");
						await state();
						await mediaStorage("readwrite", (store) => store.put(file, "background"));
						if (!disposed) {
							setMedia(file);
							publish();
						}
						return view;
					},
					async clearBackground() {
						await state();
						await mediaStorage("readwrite", (store) => store.delete("background"));
						if (!disposed) {
							setMedia();
							publish();
						}
						return view;
					},
					onVisibility(listener) {
						const sync = () => listener(!document.hidden);
						document.addEventListener("visibilitychange", sync);
						sync();
						return () => document.removeEventListener("visibilitychange", sync);
					},
					onShown(listener) {
						let subscribed = true;
						queueMicrotask(() => {
							if (subscribed && !disposed) listener();
						});
						return () => {
							subscribed = false;
						};
					},
					async claimIntro() {
						await state();
						if (disposed || introClaimed) return false;
						introClaimed = true;
						return view.introEnabled;
					},
					async presentation(enabled) {
						const generation = ++presentationGeneration;
						closeIntro?.();
						closeIntro = void 0;
						if (!enabled || disposed) return;
						await state();
						if (!disposed && generation === presentationGeneration) closeIntro = showWorkspaceIntro(view);
					},
					toggleFullscreen: async () => {},
					async chooseVideo() {
						const file = await pick("video/mp4,video/webm");
						if (!file || disposed) return view;
						if (!["video/mp4", "video/webm"].includes(file.type) || file.size === 0 || file.size > 134217728) throw Error("Unsupported intro video");
						await state();
						await mediaStorage("readwrite", (store) => store.put(file, "intro"));
						if (!disposed) {
							setIntro(file);
							publish();
						}
						return view;
					},
					async clearVideo() {
						await state();
						await mediaStorage("readwrite", (store) => store.delete("intro"));
						if (!disposed) {
							setIntro();
							publish();
						}
						return view;
					}
				},
				dispose: () => {
					disposed = true;
					cancelPicker?.();
					closeIntro?.();
					listeners.clear();
					if (view.backgroundURL) URL.revokeObjectURL(view.backgroundURL);
					if (view.mediaURL) URL.revokeObjectURL(view.mediaURL);
					database?.then((db) => db.close(), () => void 0);
				}
			};
		}
		//#endregion
		//#region src/client/astrology/stock-slider.ts
		/** Enhance the stock model-effort pane while keeping selection in the Host's own buttons. */
		function mountStockSlider() {
			let control;
			let options = [];
			let frame = 0;
			const sync = () => {
				frame = 0;
				const id = document.querySelector("button[aria-expanded=\"true\"][aria-controls]:has([class*=\"_triggerEffort\"])")?.getAttribute("aria-controls");
				const menu = id && document.getElementById(id);
				const pane = menu && menu.matches("[data-menu-material][role=\"menu\"]") ? menu : void 0;
				const choices = pane ? [...pane.querySelectorAll(":scope > button[role=\"menuitemradio\"][aria-checked]:not([id])")] : [];
				if (choices.length < 2 || !pane) {
					control?.remove();
					control = void 0;
					options = [];
					return;
				}
				if (!control?.isConnected || control.parentElement !== pane || choices.length !== options.length || choices.some((item, i) => item !== options[i])) {
					control?.remove();
					options = choices;
					control = document.createElement("label");
					control.className = "dsh-astrology-effort";
					const caption = document.createElement("span");
					const range = document.createElement("input");
					range.type = "range";
					range.min = "0";
					range.max = String(choices.length - 1);
					range.step = "1";
					range.setAttribute("aria-label", document.documentElement.lang.startsWith("zh") ? "思考强度" : "Reasoning effort");
					const describe = () => {
						const name = choices[Number(range.value)]?.textContent?.trim() ?? "";
						caption.textContent = name;
						range.setAttribute("aria-valuetext", name);
					};
					range.addEventListener("input", describe);
					range.addEventListener("change", () => {
						const option = choices[Number(range.value)];
						if (option?.isConnected && !option.disabled) option.click();
					});
					range.addEventListener("keydown", (event) => {
						if ([
							"ArrowLeft",
							"ArrowRight",
							"ArrowUp",
							"ArrowDown",
							"Home",
							"End"
						].includes(event.key)) event.stopPropagation();
					});
					range.value = String(Math.max(0, choices.findIndex((item) => item.getAttribute("aria-checked") === "true")));
					describe();
					control.append(caption, range);
					pane.insertBefore(control, choices[0]);
				}
				const range = control.querySelector("input");
				range.disabled = choices.some((item) => item.disabled);
			};
			const observer = new MutationObserver(() => {
				if (!frame) frame = requestAnimationFrame(sync);
			});
			observer.observe(document.body, {
				childList: true,
				subtree: true,
				attributes: true,
				attributeFilter: [
					"aria-controls",
					"aria-expanded",
					"aria-checked",
					"disabled"
				]
			});
			sync();
			return () => {
				observer.disconnect();
				cancelAnimationFrame(frame);
				control?.remove();
			};
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
		const ASTROLOGY_CSS = "/* Scoped Astrology workspace presentation; official primitives remain responsible for layout. */\nhtml[data-astrology]{background:#100d18}\nhtml[data-astrology] body{--astrology-effort-accent:var(--dsw-alias-brand-primary);--astrology-effort-duration:120ms;--astrology-effort-surface:var(--dsw-alias-bg-layer-1);--astrology-effort-pill:var(--dsw-alias-bg-layer-2);--astrology-effort-pill-hover:var(--dsw-alias-interactive-bg-hover);--astrology-effort-track:var(--dsw-alias-bg-multi-select);--astrology-effort-secondary:var(--dsw-alias-label-secondary);--astrology-effort-muted:var(--dsw-alias-label-tertiary);--astrology-effort-thumb:color-mix(in srgb,var(--dsw-alias-brand-primary) 12%,white)}\nhtml[data-astrology][data-astrology-slider-style=stage] body{--astrology-effort-accent:var(--dsw-alias-brand-primary);--astrology-effort-value:#d8b56a}\nhtml[data-astrology][data-astrology-slider-style=minimal] body{--astrology-effort-accent:var(--dsw-alias-label-secondary);--astrology-effort-highlight:var(--dsw-alias-label-secondary)}\nhtml[data-astrology][data-astrology-slider-motion=false] body{--astrology-effort-duration:0ms}\nhtml[data-astrology]:has(body:not([data-ds-dark-theme])){background:#f7f4fb}\n/* This document is the entered workspace; the intro window uses a separate origin and stylesheet. */\nhtml[data-astrology] body:has(#astrology-workspace-background-layer){position:relative;isolation:isolate}\n#astrology-workspace-background-layer{position:fixed;inset:0;z-index:0;pointer-events:none;isolation:isolate}\n.astrology-workspace-background,.astrology-workspace-scrim{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}\n.astrology-workspace-background{z-index:0;object-fit:cover}\n.astrology-workspace-background-failed{display:none}\nhtml[data-astrology] #root{position:relative;z-index:1}\n.astrology-workspace-scrim{z-index:1;background:rgba(10,7,16,.16)}\nhtml[data-astrology][data-astrology-background-fit=contain] .astrology-workspace-background{object-fit:contain}\n/* Declare materials on body so menus portalled beside #root inherit them too.\n   Each fill has its own alpha; nested cards never reapply the opaque palette. */\nhtml[data-astrology] body:has(#astrology-workspace-background-layer){\n  --astrology-glass-rgb:250 250 254;\n  --astrology-glass-opacity:76%;\n  --astrology-glass-line:rgb(255 255 255 / .38);\n  --astrology-glass-shadow:0 12px 36px rgb(24 20 38 / .12);\n  --astrology-glass-blur:blur(28px) saturate(1.08);\n  --astrology-glass-surface:color-mix(in srgb,rgb(var(--astrology-glass-rgb)) var(--astrology-glass-opacity),transparent);\n  --astrology-glass-control:rgb(var(--astrology-glass-rgb) / .38);\n  --astrology-glass-hover:color-mix(in srgb,var(--dsw-alias-brand-primary) 9%,rgb(var(--astrology-glass-rgb) / .32));\n  --astrology-glass-active:color-mix(in srgb,var(--dsw-alias-brand-primary) 16%,rgb(var(--astrology-glass-rgb) / .4));\n  --dsw-alias-bg-layer-1:var(--astrology-glass-control);\n  --dsw-alias-bg-layer-2:var(--astrology-glass-surface);\n  --dsw-alias-bg-layer-3:var(--astrology-glass-surface);\n  --dsw-alias-bg-overlay:var(--astrology-glass-surface);\n  --dsw-alias-bg-module-platform:var(--astrology-glass-surface);\n  --dsw-alias-bg-multi-select:var(--astrology-glass-active);\n  --dsw-specific-sidebar-fill:transparent;\n  --dsw-specific-input-major:rgb(var(--astrology-glass-rgb) / .52);\n  --dsw-specific-selector:var(--astrology-glass-control);\n  --dsw-menu-surface-fill:var(--astrology-glass-surface);\n  --dsw-specific-menu:var(--astrology-glass-surface);\n  --dsw-alias-menu-group-header-fill:var(--astrology-glass-surface);\n  --dsw-menu-backdrop-filter:var(--astrology-glass-blur);\n  --dsw-alias-button-elevated-fill:var(--astrology-glass-control);\n  --dsw-alias-button-floating-fill:var(--astrology-glass-control);\n  --dsw-alias-button-floating-hover:var(--astrology-glass-hover);\n  --dsw-alias-button-ghost-active-fill:var(--astrology-glass-active);\n  --dsw-alias-button-ghost-active-hover:var(--astrology-glass-hover);\n  --dsw-alias-button-tool-bar-fill:var(--astrology-glass-control);\n  --dsw-alias-button-tool-bar-hover:var(--astrology-glass-hover);\n  --dsw-alias-interactive-bg-hover:var(--astrology-glass-hover);\n  --dsw-alias-interactive-bg-hover-solid:var(--astrology-glass-hover);\n  --dsw-alias-interactive-bg-hover-accent:var(--astrology-glass-hover);\n  --dsw-alias-interactive-bg-active:var(--astrology-glass-active);\n  --dsw-specific-sidebar-nav-item-active-accent:var(--astrology-glass-active);\n  --dsw-specific-sidebar-nav-item-active:var(--astrology-glass-active);\n  --dsw-specific-sidebar-nav-item-hover:var(--astrology-glass-hover);\n  --dsw-alias-state-business-tertiary:var(--astrology-glass-active);\n  --dsw-alias-settings-card-fill:rgb(var(--astrology-glass-rgb) / .16);\n  --dsw-alias-border-l1:color-mix(in srgb,var(--dsw-alias-label-primary) 10%,transparent);\n  --dsw-alias-border-l2:color-mix(in srgb,var(--dsw-alias-label-primary) 12%,transparent);\n  --dsw-alias-border-l3:color-mix(in srgb,var(--dsw-alias-label-primary) 15%,transparent);\n  --dsw-alias-border-l4:color-mix(in srgb,var(--dsw-alias-label-primary) 20%,transparent);\n  --dsw-alias-button-ghost-active-border:var(--dsw-alias-border-l3);\n  --dsw-alias-settings-card-stroke:var(--dsw-alias-border-l2);\n  --dsw-elevation-stroke-color:var(--dsw-alias-border-l3);\n  --astrology-effort-surface:var(--astrology-glass-surface);\n  --astrology-effort-pill:var(--astrology-glass-control);\n  --astrology-effort-pill-hover:var(--astrology-glass-hover);\n  --astrology-effort-track:var(--astrology-glass-active);\n}\nhtml[data-astrology] body[data-ds-dark-theme]:has(#astrology-workspace-background-layer){\n  --astrology-glass-rgb:24 26 34;\n  --astrology-glass-opacity:72%;\n  --astrology-glass-line:rgb(255 255 255 / .09);\n  --astrology-glass-shadow:0 12px 36px rgb(0 0 0 / .2);\n  --dsw-alias-label-secondary:#d3cfdf;\n  --dsw-alias-label-tertiary:#beb8cc;\n  --dsw-alias-label-caption:#beb8cc;\n}\nhtml[data-astrology] body:not([data-ds-dark-theme]) .astrology-workspace-scrim{background:rgb(247 245 252 / .48)}\nhtml[data-astrology] body[data-ds-dark-theme] .astrology-workspace-scrim{background:rgb(10 11 17 / .36)}\n/* Broad containers share the one media layer. Clear the nested sidebar browser\n   ground locally, without changing document/editor backgrounds elsewhere. */\nhtml[data-astrology] #root [class*=\"frame\"]:has(> [class*=\"sidebarCol\"]){background:transparent}\nhtml[data-astrology] #root [class*=\"centerCol\"]{background:transparent;border-radius:0;border-left:0;--dsw-alias-bg-base:transparent}\nhtml[data-astrology] #root [class*=\"sidebarCol\"]{position:relative;isolation:isolate;background:transparent;border-right:0}\nhtml[data-astrology] #root [class*=\"sidebarCol\"]::before{content:\"\";position:absolute;inset:0;z-index:-1;pointer-events:none;background:rgb(var(--astrology-glass-rgb) / .28);backdrop-filter:blur(22px) saturate(1.08);-webkit-backdrop-filter:blur(22px) saturate(1.08);mask-image:linear-gradient(to right,#000 65%,transparent)}\nhtml[data-astrology] #root [class*=\"regionArea\"]{--dsw-alias-bg-base:transparent}\n/* Docked panes, empty panes and floating panels share the workspace ground.\n   Paint glass on each pane's decorative layer: the right-column carrier must\n   not become a containing block or stacking context for fixed floating tabs. */\nhtml[data-astrology] body:has(#astrology-workspace-background-layer) #root [class*=\"rightbarCol\"]{background:transparent;--dsw-alias-bg-base:transparent}\nhtml[data-astrology] body:has(#astrology-workspace-background-layer) #root [data-sidebar-right-panel] :is([data-dockkit-pane],[data-dockkit-float]){isolation:isolate;background:transparent;border-radius:0}\nhtml[data-astrology] body:has(#astrology-workspace-background-layer) #root [data-sidebar-right-panel] [data-dockkit-pane]{position:relative}\nhtml[data-astrology] body:has(#astrology-workspace-background-layer) #root [data-sidebar-right-panel] :is([data-dockkit-pane],[data-dockkit-float])::before{content:\"\";position:absolute;inset:0;z-index:-1;pointer-events:none;background:var(--astrology-glass-control);backdrop-filter:var(--astrology-glass-blur);-webkit-backdrop-filter:var(--astrology-glass-blur)}\nhtml[data-astrology] body:has(#astrology-workspace-background-layer) #root [data-sidebar-right-panel] [data-dockkit-float]{border-radius:var(--dsw-radius-panel)}\nhtml[data-astrology] body:has(#astrology-workspace-background-layer) #root [data-sidebar-right-panel] [data-dockkit-float]::before{background:var(--astrology-glass-surface)}\n/* One full-width strip also paints beneath the transparent native caption.\n   Blur stays off layout ancestors so fixed collapse controls keep their origin. */\nhtml[data-astrology][data-windows-titlebar] body:has(#astrology-workspace-background-layer)::after{content:\"\";position:fixed;inset:0 0 auto;z-index:0;height:var(--dsh-windows-titlebar-height,40px);pointer-events:none;background:rgb(var(--astrology-glass-rgb) / .18);backdrop-filter:blur(22px) saturate(1.08);-webkit-backdrop-filter:blur(22px) saturate(1.08)}\nhtml[data-astrology][data-windows-titlebar] #root [class*=\"frame\"]:has(> [class*=\"sidebarCol\"])::before{background:transparent}\nhtml[data-astrology] #root [class*=\"newSession\"]:is(button):not(:disabled){backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);box-shadow:inset 0 1px 0 var(--astrology-glass-line)}\nhtml[data-astrology] #root [data-composer-card]{backdrop-filter:blur(22px) saturate(1.08);-webkit-backdrop-filter:blur(22px) saturate(1.08);box-shadow:var(--dsw-elevation-soft),inset 0 1px 0 var(--astrology-glass-line)}\nhtml[data-astrology] body:has(#astrology-workspace-background-layer) [role=\"dialog\"][aria-modal=\"true\"]{background:var(--astrology-glass-surface);backdrop-filter:var(--astrology-glass-blur);-webkit-backdrop-filter:var(--astrology-glass-blur);box-shadow:var(--astrology-glass-shadow),inset 0 0 0 1px var(--astrology-glass-line)}\nhtml[data-astrology] body:has(#astrology-workspace-background-layer) [data-menu-material]{box-shadow:var(--astrology-glass-shadow),inset 0 0 0 1px var(--astrology-glass-line)}\n/* MenuSurface owns the blurred backing. Keep its nested slider transparent to\n   avoid two fills and two backdrop roots on the same floating panel. */\nhtml[data-astrology] body:has(#astrology-workspace-background-layer) [data-effort-slider]{background:transparent;box-shadow:none}\nhtml[data-astrology] body:has(#astrology-workspace-background-layer) [data-menu-material][data-effort-compact]{background:transparent}\n@media(prefers-reduced-transparency:reduce){\n  html[data-astrology] body:has(#astrology-workspace-background-layer){--astrology-glass-opacity:100%;--astrology-glass-control:rgb(var(--astrology-glass-rgb));--dsw-specific-input-major:rgb(var(--astrology-glass-rgb));--dsw-alias-settings-card-fill:rgb(var(--astrology-glass-rgb));--astrology-glass-blur:none;--astrology-effort-surface:var(--astrology-glass-surface)}\n  html[data-astrology] #root [class*=\"sidebarCol\"]::before{background:rgb(var(--astrology-glass-rgb));mask-image:none;backdrop-filter:none;-webkit-backdrop-filter:none}\n  html[data-astrology] #root [data-composer-card],html[data-astrology] #root [class*=\"newSession\"]:is(button){backdrop-filter:none;-webkit-backdrop-filter:none}\n  html[data-astrology][data-windows-titlebar] body:has(#astrology-workspace-background-layer)::after{background:rgb(var(--astrology-glass-rgb));backdrop-filter:none;-webkit-backdrop-filter:none}\n}\n.astrology-intro{padding:0;max-width:none;max-height:none;width:100vw;height:100vh;border:0;background:#100d18;color:#f4effa;overflow:hidden;font:13px/1.6 \"Segoe UI\",\"Microsoft YaHei\",sans-serif}\n.astrology-intro::backdrop{background:#100d18}\n.astrology-intro [hidden]{display:none!important}\n.astrology-stage{position:absolute;inset:0;background:radial-gradient(ellipse at 65% 30%,#4c2d7155,transparent 55%),radial-gradient(ellipse at 25% 75%,#47324b66,transparent 60%),#100d18}\n.astrology-stage video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#050307}\n.astrology-intro[data-phase=video] .glow,.astrology-intro[data-phase=video] .cursor{display:none}\n.astrology-stage .glow{position:absolute;inset:-12px;background:linear-gradient(115deg,transparent 25%,#b59aea0c 30%,transparent 35%,transparent 65%,#d8b56a0c 70%,transparent 75%);pointer-events:none;transform:translate(var(--px,0px),var(--py,0px))}\n.astrology-stage .cursor{position:absolute;left:50%;top:50%;width:300px;height:300px;background:radial-gradient(circle,#d5bcff12,transparent 65%);transform:translate(-50%,-50%);pointer-events:none}\n.astrology-intro .brand{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;pointer-events:none}\n.astrology-logo{width:clamp(140px,24vh,240px);height:clamp(140px,24vh,240px);margin-bottom:16px;overflow:visible;filter:drop-shadow(0 0 24px #a78bfa25)}\n.astrology-intro h1{font-size:clamp(36px,5vw,64px);line-height:1.2;letter-spacing:18px;text-indent:18px;margin:0 0 18px;font-weight:400}\n.astrology-intro .english{letter-spacing:10px;text-indent:10px;color:#d8b56a;font-size:12px}\n.astrology-intro .caption{font-size:12px;color:#c4b5d5;letter-spacing:3px;margin-top:26px}\n.astrology-intro .ripple{position:absolute;width:12px;height:12px;border:1px solid #d8b56a;border-radius:50%;pointer-events:none;animation:astrology-ripple .6s ease-out forwards}\n.astrology-intro[data-phase=logo] .logo-orbits ellipse{stroke-dasharray:1;stroke-dashoffset:1;animation:astrology-orbit 1.4s cubic-bezier(.22,.7,.3,1) .1s forwards}\n.astrology-intro[data-phase=logo] .logo-orbits ellipse+ellipse{animation-delay:.25s;opacity:.45}\n.astrology-intro[data-phase=logo] .logo-whale{transform-origin:120px 120px;animation:astrology-whale 1.1s cubic-bezier(.22,.7,.3,1) both}\n.astrology-intro[data-phase=logo] .logo-stars{transform-origin:120px 120px;animation:astrology-stars 1.4s ease-out .4s both}\n.astrology-intro[data-phase=logo] h1{animation:astrology-name .8s ease-out .3s both}\n.astrology-intro[data-phase=logo] .english{animation:astrology-name .8s ease-out .55s both}\n.astrology-intro[data-phase=logo] .caption{animation:astrology-name .8s ease-out .85s both}\n.astrology-stage[data-paused=true] *{animation-play-state:paused!important}\n@keyframes astrology-orbit{to{stroke-dashoffset:0}}\n@keyframes astrology-whale{from{opacity:0;transform:translateY(16px) scale(.88)}to{opacity:1;transform:translateY(0) scale(1)}}\n@keyframes astrology-stars{0%{opacity:0;transform:scale(.75)}60%{opacity:1;transform:scale(1.06)}100%{opacity:1;transform:scale(1)}}\n@keyframes astrology-name{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}\n@keyframes astrology-ripple{to{transform:translate(-50%,-50%) scale(9);opacity:0}}\n@media(prefers-reduced-motion:reduce){.astrology-stage .cursor,.astrology-stage .glow,.astrology-stage .ripple{display:none}.astrology-intro[data-phase=logo] *{animation:none!important}.astrology-intro[data-phase=logo] .logo-orbits ellipse{stroke-dashoffset:0}}\n\n.dsh-astrology-brand { display: flex; flex-direction: column; gap: 1px; height: 24px; flex: none; max-width: 160px; overflow: hidden; text-align: left; }\n.dsh-astrology-brand > span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 15px; line-height: 16px; font-weight: 600; letter-spacing: 4px; color: var(--dsw-alias-label-primary); }\n.dsh-astrology-brand > small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 7px; line-height: 7px; letter-spacing: 1.8px; color: var(--dsw-alias-brand-primary); }\n\n.dsh-astrology-settings { width: min(100%, 680px); box-sizing: border-box; color: var(--dsw-alias-label-primary); padding: 4px 0 28px; }\n.dsh-astrology-pageHeader { margin-bottom: 24px; }\n.dsh-astrology-pageHeader h2 { margin: 0 0 7px; font-size: 22px; line-height: 1.35; font-weight: 650; letter-spacing: -.2px; }\n.dsh-astrology-pageHeader p,.dsh-astrology-groupHeader p { margin: 0; color: var(--dsw-alias-label-secondary); font-size: 13px; line-height: 1.65; }\n.dsh-astrology-loading { color: var(--dsw-alias-label-tertiary); font-size: 13px; }\n\n.dsh-astrology-group { margin-top: 24px; }\n.dsh-astrology-groupHeader { margin: 0 0 10px; }\n.dsh-astrology-groupHeader h3 { margin: 0 0 4px; color: var(--dsw-alias-label-primary); font-size: 15px; line-height: 1.45; font-weight: 600; }\n.dsh-astrology-groupHeader p { max-width: 620px; }\n.dsh-astrology-card { display: block; min-width: 0; margin: 0; padding: 4px 16px; border: 1px solid color-mix(in srgb,var(--dsw-alias-border-l3) 48%,transparent); border-radius: var(--dsw-radius-lg); background: color-mix(in srgb,var(--dsw-alias-bg-layer-1) 34%,transparent); backdrop-filter: blur(16px) saturate(1.08); -webkit-backdrop-filter: blur(16px) saturate(1.08); box-shadow: inset 0 1px 0 rgba(255,255,255,.035); }\n.dsh-astrology-card:disabled { opacity: .72; }\n.dsh-astrology-row { display: flex; align-items: center; justify-content: space-between; gap: 24px; min-height: 52px; color: var(--dsw-alias-label-primary); font-size: 14px; cursor: pointer; }\n.dsh-astrology-row + .dsh-astrology-row { border-top: 1px solid var(--dsw-alias-border-l3); }\n.dsh-astrology-row input[type='checkbox'] { width: 18px; height: 18px; flex: none; accent-color: var(--dsw-alias-brand-primary); cursor: pointer; }\n.dsh-astrology-textInput,.dsh-astrology-row select { max-width: 60%; min-width: 150px; min-height: 36px; box-sizing: border-box; padding: 0 12px; border: 1px solid color-mix(in srgb,var(--dsw-alias-border-l3) 58%,transparent); border-radius: 999px; color: var(--dsw-alias-label-primary); background: color-mix(in srgb,var(--dsw-alias-bg-layer-2) 38%,transparent); font: inherit; }\n.dsh-astrology-row select { min-width: 175px; cursor: pointer; }\n.dsh-astrology-textInput { width: min(55%, 280px); }\n.dsh-astrology-cardFooter { display: flex; align-items: center; justify-content: space-between; gap: 16px; min-height: 56px; padding: 8px 0; border-top: 1px solid var(--dsw-alias-border-l3); }\n.dsh-astrology-helper { min-width: 0; color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 1.55; }\n.dsh-astrology-inlineNote { margin: 0; padding: 10px 0 12px; color: var(--dsw-alias-label-tertiary); font-size: 12px; line-height: 1.55; }\n.dsh-astrology-buttonGroup { display: flex; flex: none; flex-wrap: wrap; gap: 8px; }\n.dsh-astrology-primaryButton,.dsh-astrology-secondaryButton { min-height: 36px; box-sizing: border-box; padding: 0 16px; border: 1px solid color-mix(in srgb,var(--dsw-alias-border-l3) 58%,transparent); border-radius: 999px; color: var(--dsw-alias-label-primary); background: color-mix(in srgb,var(--dsw-alias-bg-layer-2) 38%,transparent); font: inherit; font-size: 13px; cursor: pointer; transition: background-color 120ms ease, border-color 120ms ease, transform 120ms ease; }\n.dsh-astrology-primaryButton { border-color: color-mix(in srgb,var(--dsw-alias-brand-primary) 72%,transparent); color: var(--dsw-static-neutral-bluish-00); background: color-mix(in srgb,var(--dsw-alias-brand-primary) 82%,transparent); }\nbody[data-ds-dark-theme] .dsh-astrology-primaryButton { color: var(--dsw-static-neutral-bluish-1000); }\n.dsh-astrology-primaryButton:hover:not(:disabled) { filter: brightness(1.06); }\n.dsh-astrology-secondaryButton:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); }\n.dsh-astrology-primaryButton:active:not(:disabled),.dsh-astrology-secondaryButton:active:not(:disabled) { transform: translateY(1px); }\n.dsh-astrology-primaryButton:disabled,.dsh-astrology-secondaryButton:disabled { opacity: .48; cursor: default; }\n.dsh-astrology-settings :focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 3px; }\n.dsh-astrology-status { min-height: 22px; margin: 12px 0 0; color: var(--dsw-alias-label-secondary); font-size: 12px; }\n.dsh-astrology-settings .dsh-astrology-status:empty { min-height: 0; margin-top: 0; }\n\n@media (max-width: 560px) {\n  .dsh-astrology-card { padding: 3px 12px; }\n  .dsh-astrology-row { gap: 12px; }\n  .dsh-astrology-row select { min-width: 145px; }\n  .dsh-astrology-cardFooter { align-items: flex-start; flex-direction: column; justify-content: center; }\n  .dsh-astrology-buttonGroup { width: 100%; }\n}\n.dsh-astrology-intro {\n  position: fixed; inset: 0; margin: 0; border: 0; padding: 0; max-width: none; max-height: none;\n  width: 100%; height: 100%; overflow: hidden; background: #100d18; color: #f7e2ac;\n}\n.dsh-astrology-intro[open] { display: grid; place-items: center; }\n.dsh-astrology-intro::backdrop { background: #100d18; }\n.dsh-astrology-intro video { position: absolute; inset: 0; width: 100%; height: 100%; }\n.dsh-astrology-intro button {\n  position: absolute; right: 24px; bottom: 24px; padding: 8px 16px; border: 1px solid #f7e2ac;\n  border-radius: 999px; background: #100d18; color: #f7e2ac; cursor: pointer;\n}\n.dsh-astrology-introLogo {\n  font: 600 clamp(24px, 5vw, 72px) system-ui; letter-spacing: .18em;\n  animation: dsh-astrology-reveal 1.5s ease both;\n}\n@keyframes dsh-astrology-reveal {\n  from { opacity: 0; transform: translateY(12px) scale(.96); }\n  to { opacity: 1; transform: none; }\n}\n.dsh-astrology-effort { display: grid; gap: 6px; padding: 8px 12px; color: var(--dsw-alias-label-secondary); }\n.dsh-astrology-effort input { width: 100%; margin: 0; accent-color: var(--astrology-effort-accent); }\n.dsh-astrology-effort span {\n  color: var(--astrology-effort-value, var(--astrology-effort-accent));\n  transition: color var(--astrology-effort-duration, 120ms);\n}\n@media (prefers-reduced-motion: reduce) {\n  .dsh-astrology-introLogo { animation: none; }\n  .dsh-astrology-effort span { transition: none; }\n}\n";
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
		/** Register the client features on stock hosts and opt into native support when available. */
		function apply(ctx) {
			ctx.effect(() => ctx.theme.overrideTokens("dsh-plugin-astrology", themeOverrides), "Astrology theme tokens");
			ctx.effect(mountStylesheet, "Astrology stylesheet");
			const bridge = window.dshAstrology;
			const native = isAstrologyCarrier(bridge);
			const renderer = native ? void 0 : createRendererAstrology();
			const api = renderer?.api ?? bridge;
			if (renderer) ctx.effect(() => renderer.dispose, "Astrology renderer storage");
			ctx.plugin({
				inject: ["locale", "slots"],
				apply: (child) => mountAstrology(child, api, native)
			});
			ctx.effect(() => mountPresentation(api), "Astrology presentation");
			if (renderer) ctx.effect(mountStockSlider, "Astrology reasoning slider");
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return exports;
	}
});
