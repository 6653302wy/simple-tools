/** 缓存key */
export enum StorageEnum {
    /** 主题 */
    Theme = 'theme-mode',
    /** 工具 - 汇率参考值 */
    ToolExchangeRates = 'tool_exchange_rates',
    /** i18n - 地区 */
    I18nLocale = 'i18n_locale',
    /** i18n - 语言 */
    I18nLanguage = 'i18n_language',
    /** i18n - 时区 */
    I18nTimezone = 'i18n_timezone',
    /** 用户 - 登录token */
    UserToken = 'user_token',
}

/** 全局的dom id */
export enum DomIdEnum {
    /** 业务路由容器 */
    AppContainer = '__root-dom-app-container',
    /** 弹窗容器 */
    ModalContainer = '__root-dom-modal-container',
    /** toast容器 */
    ToastContainer = '__root-dom-toast-container',
}
