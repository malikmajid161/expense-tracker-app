package com.fintrack.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(ReleaseLinksPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
