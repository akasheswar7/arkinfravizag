package com.example.arkinfra

import android.annotation.SuppressLint
import android.content.Intent
import android.os.Bundle
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.SystemBarStyle
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.viewinterop.AndroidView
import androidx.webkit.WebViewAssetLoader
import com.example.arkinfra.theme.ArkInfraTheme

class MainActivity : ComponentActivity() {
  private var webView: WebView? = null
  private val canGoBackState = mutableStateOf(false)

  @SuppressLint("SetJavaScriptEnabled", "SetSupportZoom")
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge(
      statusBarStyle = SystemBarStyle.dark(
        android.graphics.Color.parseColor("#050D1A")
      ),
      navigationBarStyle = SystemBarStyle.dark(
        android.graphics.Color.parseColor("#050D1A")
      )
    )

    val assetLoader = WebViewAssetLoader.Builder()
      .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
      .build()

    webView = WebView(this).apply {
      // Set background color to prevent white flashes on start
      setBackgroundColor(android.graphics.Color.parseColor("#050D1A"))

      webViewClient = object : WebViewClient() {
        override fun shouldInterceptRequest(
          view: WebView?,
          request: WebResourceRequest?
        ): WebResourceResponse? {
          if (request == null) return null
          return assetLoader.shouldInterceptRequest(request.url)
        }

        override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
          val requestUrl = request?.url?.toString() ?: ""
          
          // Load local assets and website domain internally
          if (requestUrl.startsWith("file://") || 
              requestUrl.contains("appassets.androidplatform.net") || 
              requestUrl.contains("arkinfravizag.com")) {
            return false // load in webview
          }
          
          // For other domains, open in default browser
          return try {
            val intent = Intent(Intent.ACTION_VIEW, request?.url)
            context.startActivity(intent)
            true
          } catch (e: Exception) {
            false
          }
        }

        override fun doUpdateVisitedHistory(view: WebView?, url: String?, isReload: Boolean) {
          super.doUpdateVisitedHistory(view, url, isReload)
          canGoBackState.value = view?.canGoBack() ?: false
        }
      }

      settings.apply {
        javaScriptEnabled = true
        domStorageEnabled = true
        databaseEnabled = true
        loadWithOverviewMode = true
        useWideViewPort = true
        setSupportZoom(true)
        builtInZoomControls = true
        displayZoomControls = false
        
        // Enable local file access settings
        allowFileAccess = true
        allowContentAccess = true
        @Suppress("DEPRECATION")
        allowFileAccessFromFileURLs = true
        @Suppress("DEPRECATION")
        allowUniversalAccessFromFileURLs = true
      }

      loadUrl("https://appassets.androidplatform.net/assets/index.html")
    }

    setContent {
      ArkInfraTheme {
        MainScreen(
          webView = webView!!,
          canGoBack = canGoBackState.value,
          modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF050D1A))
            .safeDrawingPadding()
        )
      }
    }
  }

  override fun onDestroy() {
    webView?.destroy()
    webView = null
    super.onDestroy()
  }
}

@Composable
fun MainScreen(webView: WebView, canGoBack: Boolean, modifier: Modifier = Modifier) {
  // Intercept back navigation if the webview can go back
  BackHandler(enabled = canGoBack) {
    webView.goBack()
  }

  AndroidView(
    modifier = modifier,
    factory = { webView },
    update = {}
  )
}
