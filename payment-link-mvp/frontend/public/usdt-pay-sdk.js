/**
 * USDT支付SDK - 一键嵌入加密货币支付系统
 * 版本: 1.0.0
 * 作者: USDT Payment System
 *
 * 使用方法:
 * <script src="https://your-domain.com/usdt-pay-sdk.js"></script>
 * <script>
 *   USDTPaySDK.init({
 *     apiKey: 'your_api_key',
 *     amount: 100,
 *     currency: 'USDT',
 *     description: '商品描述',
 *     onSuccess: (data) => { console.log('支付成功', data); },
 *     onError: (error) => { console.log('支付失败', error); }
 *   });
 * </script>
 */

(function (global) {
  'use strict';

  // 默认配置
  const DEFAULT_CONFIG = {
    apiUrl: 'http://47.109.140.124:8080/api',
    embedUrl: 'http://47.109.140.124:3000',
    theme: 'light',
    width: '400px',
    height: '600px',
    position: 'center',
    zIndex: 9999,
    showClose: true,
    autoClose: 3000, // 支付成功后自动关闭时间(ms)
  };

  // SDK主类
  class USDTPaySDK {
    constructor() {
      this.config = { ...DEFAULT_CONFIG };
      this.isInitialized = false;
      this.currentPayment = null;
      this.modal = null;
      this.iframe = null;
    }

    /**
     * 初始化SDK
     * @param {Object} options - 配置选项
     */
    init(options = {}) {
      if (this.isInitialized) {
        console.warn('USDT Pay SDK already initialized');
        return;
      }

      // 验证必需参数
      if (!options.apiKey) {
        throw new Error('API Key is required');
      }
      if (!options.amount || options.amount <= 0) {
        throw new Error('Valid amount is required');
      }

      // 合并配置
      this.config = { ...this.config, ...options };
      this.isInitialized = true;

      // 自动创建支付组件
      if (options.autoShow !== false) {
        this.createPayment();
      }

      console.log('USDT Pay SDK initialized successfully');
      return this;
    }

    /**
     * 创建支付
     */
    async createPayment() {
      try {
        this._showLoading();

        // 调用API创建支付链接
        const paymentData = await this._createPaymentLink();

        if (paymentData && paymentData.payment_link) {
          this.currentPayment = paymentData.payment_link;
          this._showPaymentModal();
          this._triggerCallback('onReady', paymentData);
        } else {
          throw new Error('Failed to create payment link');
        }
      } catch (error) {
        console.error('Failed to create payment:', error);
        this._triggerCallback('onError', error);
        this._hideLoading();
      }
    }

    /**
     * 显示支付界面
     */
    show() {
      if (this.currentPayment) {
        this._showPaymentModal();
      } else {
        this.createPayment();
      }
    }

    /**
     * 隐藏支付界面
     */
    hide() {
      this._hidePaymentModal();
    }

    /**
     * 销毁SDK实例
     */
    destroy() {
      this._hidePaymentModal();
      if (this.modal && this.modal.parentNode) {
        this.modal.parentNode.removeChild(this.modal);
      }
      this.modal = null;
      this.iframe = null;
      this.currentPayment = null;
      this.isInitialized = false;
    }

    /**
     * 调用API创建支付链接
     */
    async _createPaymentLink() {
      // 首先获取JWT token
      const loginResponse = await fetch(`${this.config.apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@example.com',
          password: 'admin123'
        }),
      });

      if (!loginResponse.ok) {
        throw new Error('Authentication failed');
      }

      const loginData = await loginResponse.json();

      // 使用JWT token创建支付链接
      const response = await fetch(`${this.config.apiUrl}/payment-links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + loginData.token,
        },
        body: JSON.stringify({
          title: this.config.title || '商品支付',
          amount: this.config.amount,
          currency: this.config.currency || 'USDT',
          description: this.config.description || '',
          callback_url: this.config.callbackUrl || ''
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'API request failed');
      }

      return await response.json();
    }

    /**
     * 显示加载状态
     */
    _showLoading() {
      // 创建加载遮罩
      const loadingModal = document.createElement('div');
      loadingModal.id = 'usdt-pay-loading';
      loadingModal.innerHTML = `
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: ${this.config.zIndex};
        ">
          <div style="
            background: white;
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          ">
            <div style="
              width: 40px;
              height: 40px;
              border: 4px solid #f3f3f3;
              border-top: 4px solid #00ff88;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin: 0 auto 20px;
            "></div>
            <p style="margin: 0; color: #333; font-size: 16px;">正在创建支付链接...</p>
          </div>
        </div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      `;
      document.body.appendChild(loadingModal);
    }

    /**
     * 隐藏加载状态
     */
    _hideLoading() {
      const loading = document.getElementById('usdt-pay-loading');
      if (loading) {
        loading.parentNode.removeChild(loading);
      }
    }

    /**
     * 显示支付模态框
     */
    _showPaymentModal() {
      this._hideLoading();

      if (this.modal) {
        this.modal.style.display = 'block';
        return;
      }

      // 创建模态框
      this.modal = document.createElement('div');
      this.modal.id = 'usdt-pay-modal';
      this.modal.innerHTML = this._createModalHTML();

      document.body.appendChild(this.modal);

      // 绑定事件
      this._bindModalEvents();

      // 创建iframe
      this._createIframe();
    }

    /**
     * 隐藏支付模态框
     */
    _hidePaymentModal() {
      if (this.modal) {
        this.modal.style.display = 'none';
      }
    }

    /**
     * 创建模态框HTML
     */
    _createModalHTML() {
      return `
        <div class="usdt-pay-overlay" style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: ${this.config.zIndex};
        ">
          <div class="usdt-pay-container" style="
            position: relative;
            width: ${this.config.width};
            height: ${this.config.height};
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          ">
            ${this.config.showClose ? `
              <button class="usdt-pay-close" style="
                position: absolute;
                top: 15px;
                right: 15px;
                width: 32px;
                height: 32px;
                border: none;
                background: rgba(0, 0, 0, 0.1);
                border-radius: 50%;
                cursor: pointer;
                font-size: 18px;
                z-index: 10;
                display: flex;
                justify-content: center;
                align-items: center;
                transition: background 0.2s;
              " onmouseover="this.style.background='rgba(0,0,0,0.2)'" onmouseout="this.style.background='rgba(0,0,0,0.1)'">
                ×
              </button>
            ` : ''}
            <iframe
              id="usdt-pay-iframe"
              style="
                width: 100%;
                height: 100%;
                border: none;
                border-radius: 12px;
              "
              src=""
            ></iframe>
          </div>
        </div>
      `;
    }

    /**
     * 绑定模态框事件
     */
    _bindModalEvents() {
      // 关闭按钮事件
      const closeBtn = this.modal.querySelector('.usdt-pay-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          this.hide();
          this._triggerCallback('onCancel');
        });
      }

      // 点击遮罩关闭
      const overlay = this.modal.querySelector('.usdt-pay-overlay');
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.hide();
          this._triggerCallback('onCancel');
        }
      });

      // ESC键关闭
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.modal && this.modal.style.display !== 'none') {
          this.hide();
          this._triggerCallback('onCancel');
        }
      });
    }

    /**
     * 创建支付iframe
     */
    _createIframe() {
      this.iframe = this.modal.querySelector('#usdt-pay-iframe');
      if (this.iframe && this.currentPayment) {
        const embedUrl = `${this.config.embedUrl}/embed/pay/${this.currentPayment.link_id}?theme=${this.config.theme}`;
        this.iframe.src = embedUrl;

        // 监听iframe消息
        window.addEventListener('message', (event) => {
          this._handleIframeMessage(event);
        });
      }
    }

    /**
     * 处理iframe消息
     */
    _handleIframeMessage(event) {
      // 验证消息来源
      const allowedOrigins = [this.config.embedUrl, 'http://47.109.140.124:3000'];
      if (!allowedOrigins.includes(event.origin)) {
        return;
      }

      const { type, data } = event.data || {};

      switch (type) {
        case 'payment_success':
          this._triggerCallback('onSuccess', data);
          if (this.config.autoClose) {
            setTimeout(() => {
              this.hide();
            }, this.config.autoClose);
          }
          break;

        case 'payment_failed':
          this._triggerCallback('onError', data);
          break;

        case 'payment_cancelled':
          this._triggerCallback('onCancel', data);
          this.hide();
          break;

        case 'payment_pending':
          this._triggerCallback('onPending', data);
          break;

        case 'iframe_ready':
          this._triggerCallback('onReady', data);
          break;

        default:
          break;
      }
    }

    /**
     * 触发回调函数
     */
    _triggerCallback(eventName, data) {
      if (typeof this.config[eventName] === 'function') {
        try {
          this.config[eventName](data);
        } catch (error) {
          console.error(`Error in ${eventName} callback:`, error);
        }
      }
    }

    // 静态方法：快速创建支付
    static createPayment(options) {
      const sdk = new USDTPaySDK();
      return sdk.init(options);
    }

    // 静态方法：嵌入式组件
    static embed(containerId, options) {
      const container = document.getElementById(containerId);
      if (!container) {
        throw new Error(`Container with id "${containerId}" not found`);
      }

      // 创建嵌入式iframe
      const iframe = document.createElement('iframe');
      iframe.style.cssText = `
        width: ${options.width || '100%'};
        height: ${options.height || '500px'};
        border: none;
        border-radius: 8px;
      `;

      // 先创建支付链接，然后设置iframe src
      const sdk = new USDTPaySDK();
      sdk.config = { ...sdk.config, ...options };

      sdk._createPaymentLink().then((paymentData) => {
        if (paymentData && paymentData.payment_link) {
          const embedUrl = `${sdk.config.embedUrl}/embed/pay/${paymentData.payment_link.link_id}?theme=${options.theme || 'light'}&embedded=true`;
          iframe.src = embedUrl;
        }
      }).catch((error) => {
        console.error('Failed to create embedded payment:', error);
        if (typeof options.onError === 'function') {
          options.onError(error);
        }
      });

      container.appendChild(iframe);
      return sdk;
    }
  }

  // 全局暴露
  global.USDTPaySDK = USDTPaySDK;

  // 如果有jQuery，添加jQuery插件
  if (global.jQuery) {
    global.jQuery.fn.usdtPay = function(options) {
      return this.each(function() {
        USDTPaySDK.embed(this.id, options);
      });
    };
  }

})(window);