<template>
  <div class="container">
    <h1>Nexus Finance</h1>
    <p>Real-Time NASDAQ Intelligence</p>

    <div class="grid">
      <div class="card">
        <h2>Top Gainers</h2>
        <p>Loading...</p>
      </div>

      <div class="card">
        <h2>Top Losers</h2>
        <p>Loading...</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  padding: 40px;
  font-family: Arial;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.card {
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 8px;
}
</style>