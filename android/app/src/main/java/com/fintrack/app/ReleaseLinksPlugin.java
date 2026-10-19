package com.fintrack.app;

import android.content.Intent;
import android.net.Uri;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "ReleaseLinks")
public class ReleaseLinksPlugin extends Plugin {
    @PluginMethod
    public void open(PluginCall call) {
        String url = call.getString("url", "");
        Uri uri = Uri.parse(url);
        String prefix = "/malikmajid161/expense-tracker-app/releases/";
        if (!"https".equals(uri.getScheme()) || !"github.com".equals(uri.getHost()) || uri.getPath() == null || !uri.getPath().startsWith(prefix)) {
            call.reject("Invalid release link");
            return;
        }
        try {
            getActivity().startActivity(new Intent(Intent.ACTION_VIEW, uri));
            call.resolve();
        } catch (Exception error) {
            call.reject("No browser is available to open this release", error);
        }
    }
}
