<script>
  import { page } from "$app/stores";
  import { Header } from "$lib/components";
</script>

<div class="wrapper">
  <Header
    links={{
      Home: "/",
    }}
    buttons={{
      Account: "/account",
    }}
  />
  <div>
    <h1>{$page.status}</h1>
    <h2>{$page?.error?.message}</h2>
  </div>
</div>

<head>
  <link rel="stylesheet" href="/css/header.css" />

  <style>
    .wrapper {
      display: flex;
      flex-flow: column nowrap;
    }
    .wrapper > div:not(.header) {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-flow: column nowrap;
      height: 100%;
    }
  </style>
</head>
