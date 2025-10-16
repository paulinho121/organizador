import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../../lib/supabaseClient';
import './Auth.css';

const AuthPage = () => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Organizador Diário</h1>
        <p className="auth-subtitle">Gerencie seu dia com eficiência</p>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          localization={{
            variables: {
              sign_in: {
                email_label: 'E-mail',
                password_label: 'Senha',
                button_label: 'Entrar',
                loading_button_label: 'Entrando...',
                link_text: 'Já tem uma conta? Entre',
              },
              sign_up: {
                email_label: 'E-mail',
                password_label: 'Senha',
                button_label: 'Registrar',
                loading_button_label: 'Registrando...',
                link_text: 'Não tem uma conta? Registre-se',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default AuthPage;

