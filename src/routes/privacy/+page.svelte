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
      <h1>PRIVACY POLICY</h1>
      <p>
        At <span class="fake_link no_underline no_cursor">themafia.xyz</span>, we value your privacy and are committed to protecting
        it through our compliance with this policy.
      </p>

      <h2>COLLECTION OF INFORMATION</h2>
      <p>
        When you create an account with us, we collect certain information. This
        includes:
      </p>
      <ul>
        <li>Your username and XP</li>
        <li>
          Information required to process transactions, deliver products, and
          provide services
        </li>
        <li>
          Information you provide to us directly, such as when you contact us
          for support
        </li>
      </ul>

      <h2>USE OF COLLECTED INFORMATION</h2>
      <p>We use the collected information for various purposes including to:</p>
      <ul>
        <li>Provide, maintain, and improve our services</li>
        <li>
          Send you emails, promotional messages, and other information we think
          you will find interesting
        </li>
        <li>Process transactions, deliver products, and provide services</li>
      </ul>

      <h2>DATA PROTECTION</h2>
      <p>
        We take appropriate security measures to protect against unauthorized
        access, alteration, disclosure, or destruction of your personal
        information, username, and password.
      </p>

      <h2>COOKIES</h2>
      <p>
        We use cookies to help you navigate our website and enhance your
        experience. We also use cookies to gather information about your visit
        to our website, including your IP address, browser type, and operating
        system.
      </p>

      <h2>THIRD-PARTY SERVICES</h2>
      <p>
        We use third-party services like Firebase and Firestore for
        authentication and data storage. These services have their own privacy
        policies which you can review for more information.
      </p>

      <h2>EU GDPR COMPLIANCE</h2>
      <p>
        We are committed to ensuring that your privacy rights are protected in
        accordance with the General Data Protection Regulation (GDPR). We have
        implemented appropriate technical and organizational measures to
        safeguard your personal data against unauthorized access, alteration,
        disclosure or destruction.
      </p>
      <p>
        We are fully transparent about our data collection practices and will
        only collect personal data that is necessary for us to provide our
        services. We will inform you about the purpose of the data collection
        and how it will be used.
      </p>
      <p>
        We obtain your consent before collecting or processing your personal
        data. You have the right to withdraw your consent at any time.
      </p>
      <p>
        We take the security of your personal data seriously and implement
        strong security measures to protect it. Your personal data is stored
        securely and is not shared with third parties without your consent.
      </p>
      <p>
        In the event of a data breach, we will promptly notify you and the
        relevant authorities.
      </p>
      <p>
        If you wish to access, correct, or delete your personal data, please
        contact us. We will respond to your request within a reasonable
        timeframe.
      </p>
      <p>
        Please note that if we transfer your data outside the European Economic
        Area (EEA), we will ensure that there are adequate safeguards in place
        to protect your data.
      </p>
      <p>
        For more information about GDPR, please refer to the official <a
          href="https://gdpr.eu/"
          target="_blank"
          class="fake_link">GDPR website</a
        >.
      </p>

      <h2>RIGHT TO BE FORGOTTEN</h2>
      <p>
        You have the right to request deletion of your personal data. Please
        send your request to <a href="mailto:support@themafia.xyz" class="fake_link">support@themafia.xyz</a>.
      </p>

      <h2>UPDATES TO THIS PRIVACY POLICY</h2>
      <p>
        We may update our Privacy Policy from time to time. We will notify you
        of any changes by posting the new Privacy Policy on this page.
      </p>

      <h2>CONTACT US</h2>
      <p>
        If you have any questions about this Privacy Policy, please contact us
        at <a href="mailto:support@themafia.xyz" class="fake_link">support@themafia.xyz</a>.
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
  <title>Privacy Policy - Mafia</title>
  <link rel="stylesheet" href="/css/privacy.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
  <link
    href="https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@100;200;300;400;500;600;700;800;900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
    rel="stylesheet"
  />
  <Opengraph
    title="Privacy Policy - Mafia"
    description="Mafia's Privacy Policy. Mafia, the classic online card game, but online. Play as a Mafia, Doctor, or even a Sheriff! Your objective is to stay alive, win and outlive everyone. It\'s very easy to learn how to play, so come on and play!"
  />
  <link rel="canonical" href="https://www.themafia.xyz/privacy" />
</svelte:head>
