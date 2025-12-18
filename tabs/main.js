document.addEventListener('DOMContentLoaded', () => {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove 'active' class from all buttons and panels
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanels.forEach(panel => panel.classList.remove('active'));

      // Add 'active' class to the clicked button
      button.classList.add('active');

      // Get the target tab ID from the data-tab attribute
      const targetTabId = button.dataset.tab;

      // Add 'active' class to the corresponding content panel
      document.getElementById(targetTabId).classList.add('active');
    });
  });
});