package com.datepeice.emonotes.service;

import com.warrenstrange.googleauth.GoogleAuthenticator;
import org.springframework.stereotype.Service;

@Service
public class MfaService {
    private final GoogleAuthenticator gAuth = new GoogleAuthenticator();

    public String generateSecret() {
        return gAuth.createCredentials().getKey();
    }

    public String getQrCodeUrl(String secret, String username) {
        return String.format(
                "otpauth://totp/EmoNotes:%s?secret=%s&issuer=EmoNotes",
                username, secret
        );
    }

    public boolean verifyCode(String secret, int code) {
        return gAuth.authorize(secret, code);
    }
}
