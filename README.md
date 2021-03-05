<p align="center">
  <img width="490" height="92" src="src/assets/banner.png" alt="Logo botAgenda">
</p>

---

## Le bot Discord tout-en-un de gestion des devoirs, créé par et à destination des étudiants de l'IUT Informatique de Bordeaux

\
📦 Installation
================

### Étape 1 : Cloner le dépôt Gitlab du projet
``` bash
git clone https://gitlab.com/hubday/bot-agenda
```

### Étape 2: Installer les dépendances projet à l'aide du gestionnaire de dépendances `npm`
``` bash
cd bot-agenda/
npm install
```

Après cette étape, l'installation est terminée, mais il reste à configurer le projet. Tout est expliqué dans la section suivante.

\
⚙️ Configuration
=================

Avant de pouvoir lancer le projet et l'essayer, il est nécessaire de saisir plusieurs variables d'environnement dans un fichier de configuration `env.local`.

## Options disponibles
* **RTDB_URL** (*String, requis*): URL de connexion à la base de données Firebase Realtime Database, sans '/' à la fin.
* **RTDB_AUTH_TOKEN** (*String, requis*): Jeton d'authentification de la base de données.
* **DISCORD_BOT_TOKEN** (*String, requis*): Jeton d'authentification du bot Discord.
* **DISCORD_BOT_VERSION** (*String, requis*): La version du bot discord.
* **DISCORD_BOT_PREFIX** (*String, requis*): Le prefix lié au commandes du bot.
* **DISCORD_BUG_REPORT_WEBHOOK_URL** (*String, facultatif*): Le lien d'un webhook discord permettant de recevoir les messages de bug report.


## Exemple de fichier de configuration `env.local`:
``` c
RTDB_URL="https://{firebase-project-name}.firebaseio.com"
RTDB_AUTH_TOKEN="XXXXxXxXxXXXXXxXXXxxxXXXXxXXXXXXxxxxxxX"
DISCORD_BOT_TOKEN="XXXxXxXxXXXxXxXxXxXxXXXx.XXxxXX.XxxXXxX-XXXXxxxXxXxXxXxxxxx"
DISCORD_BOT_VERSION="0.0.0"
DISCORD_BOT_PREFIX="!"
DISCORD_BUG_REPORT_WEBHOOK_URL="https://discordapp.com/api/webhooks/XXXXXX..." (Facultatif)
```

Une fois ce fichier de configuration créé et configuré, vous êtes prêt à tester le bot !

\
🛠 Commandes disponibles
========================

*À venir*

\
🚀 Lancement du projet
=======================

Vous êtes enfin prêt! Pour démarrer le projet, il vous suffit de démarrer le bot avec la commande suivante :
```bash
npm start
```

\
👥 Contributeurs
=================
- Tomm Jobit ([tjobit](https://github.com/tjobit)) 
<<tommjobit@live.fr>>
- Célian Riboulet ([celian-rib](https://github.com/celian-rib)) 
<<celian.riboulet@gmail.com>>
- Alexandre Boin ([alexboin](https://github.com/alexboin)) 
<<contact@alexandre-boin.fr>>

\
🖼️ Captures d'écran
====================

*À venir*