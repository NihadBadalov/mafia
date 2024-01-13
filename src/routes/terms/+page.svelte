<script lang="ts">
  import { Header, Opengraph } from "$lib/components";
</script>

<div class="wrapper">
  <Header
    links={{
      Home: "/",
      Servers: "/servers",
      Discord: "/discordLink",
    }}
    buttons={{
      Account: "/account",
    }}
  />

  <div class="main">
    <div class="main_inner">
      <h1>INTRODUCTION</h1>
      <p>
        Welcome to <span class="fake_link no_underline no_cursor">themafia.xyz</span>! By using our services, you agree to abide by
        these Terms.
      </p>

      <h2>DEFINITIONS</h2>
      <p>
        For the purpose of these Terms, the following terms shall have the
        following meanings:
      </p>
      <ul>
        <li>
          <strong>Service</strong> means the services provided by <span class="fake_link no_underline no_cursor">themafia.xyz</span>.
        </li>
        <li>
          <strong>Content</strong> means any text, images, or other materials you
          submit to the Service.
        </li>
        <li><strong>User</strong> means any person who uses the Service.</li>
        <li>
          <strong>Terms</strong> refers to the general term used to refer to the
          Terms of Service, which includes these rules and guidelines set forth by
          <span class="fake_link no_underline no_cursor">themafia.xyz</span> for the use of its services.
        </li>
      </ul>

      <h2>SERVICE</h2>
      <p>
        The Service is provided by themafia.xyz. We reserve the right to modify
        or discontinue the Service at any time.
      </p>

      <h2>YOUR USE OF THE SERVICE</h2>
      <p>
        You may access and use the Service as made available to you, as long as
        you comply with this Agreement and applicable law. You may view or use
        Content for your personal, non-commercial use.
      </p>

      <h2>ACCOUNT REMOVAL</h2>
      <p>
        We reserve the right to remove User Accounts if we determine that such
        action is necessary to comply with these Terms or for any reason we deem
        reasonable.
      </p>

      <h2>PRIVACY POLICY</h2>
      <p>
        Please review our <a href="/policy" class="fake_link">Privacy Policy</a>
        for information on how we collect, use, and disclose your personal information.
      </p>

      <h2>DISPUTE RESOLUTION</h2>
      <p>
        Any disputes arising from the use of our services should be resolved
        through direct communication between the parties involved. We are not
        responsible for resolving these disputes.
      </p>

      <h2>CHANGES TO TERMS</h2>
      <p>
        We reserve the right to modify these Terms at any time. Your continued
        use of our services after changes are made constitutes acceptance of the
        new Terms.
      </p>

      <h2>CONTACT US</h2>
      <p>
        If you have any questions or concerns about these Terms, please contact
        us at <a href="mailto:support@themafia.xyz" class="fake_link"
          >support@themafia.xyz</a
        >.
      </p>
    </div>
  </div>

  <footer>
    <a href="/discordLink">Our Discord Server</a>
    <a href="/terms">Terms of Service</a>
    <a href="/privacy">Privacy Policy</a>
  </footer>
</div>

<svelte:head>
  <title>Terms of Service - Mafia</title>
  <link rel="stylesheet" href="/css/terms.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
  <link
    href="https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@100;200;300;400;500;600;700;800;900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
    rel="stylesheet"
  />
  <Opengraph
    title="Terms of Service - Mafia"
    description="Mafia's Terms of Service. Mafia, the classic online card game, but online. Play as a Mafia, Doctor, or even a Sheriff! Your objective is to stay alive, win and outlive everyone. It\'s very easy to learn how to play, so come on and play!"
  />
  <link rel="canonical" href="https://www.themafia.xyz/terms" />
</svelte:head>
