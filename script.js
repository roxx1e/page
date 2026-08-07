document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");
  const categoryTabs = document.getElementById("category-tabs");
  const tabContentContainer = document.getElementById("tab-content-container");
  const modal = document.getElementById("api-modal");
  const modalBackdrop = modal.querySelector(".modal-overlay");
  const modalContent = modal.querySelector(".modal-content");
  const closeModalButton = document.getElementById("close-modal");
  const modalTitle = document.getElementById("modal-title");
  const apiDescription = document.getElementById("api-description");
  const paramsContainer = document.getElementById("params-container");
  const submitApiButton = document.getElementById("submit-api");
  const responseContainer = document.getElementById("response-container");
  const responseStatus = document.getElementById("response-status");
  const responseTime = document.getElementById("response-time");
  const responseData = document.getElementById("response-data");

  let allEndpoints = [];
  let activeEndpoint = null;
  let closeTimer = null;

  function capitalize(value) {
    const text = String(value || "");
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function formatNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number.toLocaleString("id-ID") : "0";
  }

  function formatBytes(bytes) {
    const number = Number(bytes);

    if (!Number.isFinite(number) || number < 0) {
      return "-";
    }

    if (number >= 1024 ** 3) {
      return `${(number / 1024 ** 3).toFixed(2)} GB`;
    }

    return `${(number / 1024 ** 2).toFixed(2)} MB`;
  }

  function formatUptime(seconds) {
    const value = Math.max(0, Number(seconds) || 0);
    const days = Math.floor(value / 86400);
    const hours = Math.floor((value % 86400) / 3600);
    const minutes = Math.floor((value % 3600) / 60);

    return [
      days > 0 ? `${days}d` : null,
      `${hours}h`,
      `${minutes}m`
    ].filter(Boolean).join(" ");
  }

  function formatRequestDate(value) {
    if (!value) {
      return "Belum ada request API";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Waktu tidak tersedia";
    }

    return new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZoneName: "short"
    }).format(date);
  }

  function findLastUsedEndpoint(endpoints) {
    if (!Array.isArray(endpoints)) {
      return null;
    }

    return endpoints.reduce((latest, endpoint) => {
      if (!endpoint?.last_request_at) {
        return latest;
      }

      if (!latest?.last_request_at) {
        return endpoint;
      }

      const currentTime = new Date(endpoint.last_request_at).getTime();
      const latestTime = new Date(latest.last_request_at).getTime();

      return currentTime > latestTime ? endpoint : latest;
    }, null);
  }

  function setUsageLoadingError(message) {
    document.getElementById("usage-total-requests").textContent = "-";
    document.getElementById("usage-last-api").textContent = message;
    document.getElementById("usage-last-request").textContent = "-";

    const indicator = document.getElementById("usage-live-indicator");
    indicator.textContent = "Offline";
    indicator.className = "inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700";
  }

  async function displayServerStatus() {
    try {
      const response = await fetch("/server-status", { cache: "no-store" });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!data.success || !data.os) {
        throw new Error(data.error || "Data server tidak tersedia");
      }

      document.getElementById("status-platform").textContent = capitalize(data.os.platform);
      document.getElementById("status-arch").textContent = data.os.arch || "-";
      document.getElementById("status-uptime").textContent = formatUptime(data.os.uptime);
      document.getElementById("status-ram").textContent =
        `${formatBytes(data.os.usedMemory)} / ${formatBytes(data.os.totalMemory)}`;
    } catch (error) {
      console.error("Error fetching server status:", error);
      document.getElementById("status-platform").textContent = "Unavailable";
      document.getElementById("status-arch").textContent = "-";
      document.getElementById("status-uptime").textContent = "-";
      document.getElementById("status-ram").textContent = "-";
    }
  }

  async function displayUsageStats() {
    try {
      const response = await fetch("/usage-stats", { cache: "no-store" });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.status === false) {
        throw new Error(data.error || "Statistik API tidak tersedia");
      }

      const totalRequests = data.api?.total_requests ?? data.total_requests ?? 0;
      const lastEndpoint = findLastUsedEndpoint(data.endpoints);

      document.getElementById("usage-total-requests").textContent = formatNumber(totalRequests);
      document.getElementById("usage-last-api").textContent =
        lastEndpoint?.path || "Belum ada request API";
      document.getElementById("usage-last-request").textContent =
        formatRequestDate(lastEndpoint?.last_request_at);

      const indicator = document.getElementById("usage-live-indicator");
      indicator.textContent = "Live";
      indicator.className = "inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700";
    } catch (error) {
      console.error("Error fetching usage stats:", error);
      setUsageLoadingError("Statistik tidak tersedia");
    }
  }

  async function fetchAPIs() {
    try {
      const response = await fetch("/endpoints", { cache: "no-store" });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!data.status || !Array.isArray(data.endpoints)) {
        throw new Error(data.error || "Daftar API tidak tersedia");
      }

      allEndpoints = data.endpoints;
      renderFilteredEndpoints();
    } catch (error) {
      console.error("Error fetching API data:", error);
      categoryTabs.innerHTML = "";
      tabContentContainer.innerHTML =
        '<p class="text-center text-red-500">Gagal memuat data API. Silakan coba lagi nanti.</p>';
    }
  }

  function createApiCard(apiName, apiDetails) {
    const card = document.createElement("button");
    card.type = "button";
    card.className =
      "api-card w-full text-left bg-white bg-opacity-90 rounded-lg shadow-md p-5 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105";

    const title = document.createElement("h3");
    title.className = "text-xl font-semibold mb-2";
    title.textContent = apiName;

    const description = document.createElement("p");
    description.className = "text-gray-600 text-sm";
    description.textContent = apiDetails.desc || "Tidak ada deskripsi.";

    card.append(title, description);
    card.addEventListener("click", () => {
      openApiModal(apiName, apiDetails.path, apiDetails.desc);
    });

    return card;
  }

  function populateAPICardsAndTabs(endpointsToDisplay) {
    categoryTabs.innerHTML = "";
    tabContentContainer.innerHTML = "";

    if (!endpointsToDisplay.length) {
      tabContentContainer.innerHTML =
        '<p class="text-center text-gray-500 mt-8">Tidak ada API yang ditemukan sesuai pencarian Anda.</p>';
      return;
    }

    endpointsToDisplay.forEach((category) => {
      const tabButton = document.createElement("button");
      tabButton.type = "button";
      tabButton.className = "tab-button px-4 py-2 rounded-full text-gray-700 font-medium";
      tabButton.dataset.category = category.name;
      tabButton.textContent = category.name;
      categoryTabs.appendChild(tabButton);

      const contentDiv = document.createElement("div");
      contentDiv.className = "tab-content grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4";
      contentDiv.dataset.category = category.name;
      tabContentContainer.appendChild(contentDiv);

      category.items.forEach((api) => {
        const apiName = Object.keys(api)[0];
        const apiDetails = api[apiName];

        if (apiName && apiDetails) {
          contentDiv.appendChild(createApiCard(apiName, apiDetails));
        }
      });
    });

    registerTabHandlers();
    activateInitialTab();
  }

  function registerTabHandlers() {
    const tabButtons = document.querySelectorAll(".tab-button");
    const tabContents = document.querySelectorAll(".tab-content");

    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        tabButtons.forEach((item) => item.classList.remove("active-tab"));
        tabContents.forEach((content) => content.classList.remove("active"));

        button.classList.add("active-tab");

        const matchingContent = Array.from(tabContents).find(
          (content) => content.dataset.category === button.dataset.category
        );

        matchingContent?.classList.add("active");
        button.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      });
    });
  }

  function activateInitialTab() {
    const preferredTab = document.querySelector('.tab-button[data-category="AI"]');
    const firstTab = document.querySelector(".tab-button");
    (preferredTab || firstTab)?.click();
  }

  function filterEndpoints(searchTerm) {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return allEndpoints.map((category) => ({
        ...category,
        items: Array.isArray(category.items) ? [...category.items] : []
      }));
    }

    return allEndpoints.reduce((result, category) => {
      const items = (Array.isArray(category.items) ? category.items : []).filter((api) => {
        const apiName = Object.keys(api)[0] || "";
        const apiDetails = api[apiName] || {};

        return (
          apiName.toLowerCase().includes(term) ||
          String(apiDetails.desc || "").toLowerCase().includes(term)
        );
      });

      if (items.length) {
        result.push({ name: category.name, items });
      }

      return result;
    }, []);
  }

  function renderFilteredEndpoints() {
    populateAPICardsAndTabs(filterEndpoints(searchInput.value));
  }

  function extractEndpointParams(endpoint) {
    const parsedUrl = new URL(endpoint, window.location.origin);
    const params = new Map();

    parsedUrl.searchParams.forEach((value, key) => {
      params.set(key, {
        name: key,
        optional: key.startsWith("_"),
        type: "query"
      });
    });

    const placeholderMatches = endpoint.match(/{([^}]+)}/g) || [];

    placeholderMatches.forEach((match) => {
      const name = match.slice(1, -1);
      params.set(name, {
        name,
        optional: name.startsWith("_"),
        type: "path"
      });
    });

    return Array.from(params.values());
  }

  function createParamField(param) {
    const wrapper = document.createElement("div");
    wrapper.className = "mb-3";

    const label = document.createElement("label");
    label.htmlFor = `param-${param.name}`;
    label.className = "block text-sm font-medium text-gray-700 mb-1";
    label.textContent = `${param.name}${param.optional ? " (opsional)" : ""}:`;

    const input = document.createElement("input");
    input.type = "text";
    input.id = `param-${param.name}`;
    input.dataset.paramName = param.name;
    input.dataset.paramType = param.type;
    input.dataset.optional = String(param.optional);
    input.className =
      "w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500";
    input.placeholder = `Enter ${param.name}${param.optional ? " (opsional)" : ""}`;

    const error = document.createElement("div");
    error.id = `error-${param.name}`;
    error.className = "text-red-500 text-xs mt-1 hidden";
    error.textContent = "Kolom ini wajib diisi";

    wrapper.append(label, input, error);
    return wrapper;
  }

  function openApiModal(name, endpoint, description) {
    activeEndpoint = {
      name,
      endpoint,
      method: "GET",
      params: extractEndpointParams(endpoint)
    };

    const oldUrlDisplay = modalContent.querySelector(".urlDisplay");
    oldUrlDisplay?.remove();

    responseContainer.classList.add("hidden");
    responseData.innerHTML = "";
    responseStatus.textContent = "";
    responseTime.textContent = "";
    submitApiButton.classList.remove("hidden");
    paramsContainer.classList.remove("hidden");
    paramsContainer.innerHTML = "";

    modalTitle.textContent = name;
    apiDescription.textContent = description || "Tidak ada deskripsi.";

    if (activeEndpoint.params.length) {
      activeEndpoint.params.forEach((param) => {
        paramsContainer.appendChild(createParamField(param));
      });
    } else {
      const emptyMessage = document.createElement("p");
      emptyMessage.className = "text-gray-500 text-sm italic";
      emptyMessage.textContent = "Tidak ada parameter yang diperlukan untuk API ini.";
      paramsContainer.appendChild(emptyMessage);
    }

    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }

    modal.classList.remove("hidden");
    document.body.classList.add("noscroll");
    void modal.offsetWidth;
    modal.classList.add("opacity-100");
    modalBackdrop.classList.add("opacity-50");
    modalContent.classList.add("scale-100", "opacity-100");
  }

  function closeModal() {
    modal.classList.remove("opacity-100");
    modalBackdrop.classList.remove("opacity-50");
    modalContent.classList.remove("scale-100", "opacity-100");

    closeTimer = setTimeout(() => {
      modal.classList.add("hidden");
      document.body.classList.remove("noscroll");
      activeEndpoint = null;
    }, 300);
  }

  function validateParams() {
    let valid = true;

    paramsContainer.querySelectorAll("input[data-param-name]").forEach((input) => {
      const isOptional = input.dataset.optional === "true";
      const error = document.getElementById(`error-${input.dataset.paramName}`);
      const isEmpty = !input.value.trim();

      error?.classList.toggle("hidden", isOptional || !isEmpty);
      input.classList.toggle("border-red-500", !isOptional && isEmpty);

      if (!isOptional && isEmpty) {
        valid = false;
      }
    });

    return valid;
  }

  function buildRequestUrl() {
    let endpoint = activeEndpoint.endpoint;
    const originalUrl = new URL(endpoint, window.location.origin);
    const queryParams = new URLSearchParams(originalUrl.search);

    paramsContainer.querySelectorAll("input[data-param-name]").forEach((input) => {
      const name = input.dataset.paramName;
      const value = input.value.trim();
      const isOptional = input.dataset.optional === "true";

      if (isOptional && !value) {
        queryParams.delete(name);
        return;
      }

      if (input.dataset.paramType === "path") {
        endpoint = endpoint.replaceAll(`{${name}}`, encodeURIComponent(value));
      } else {
        queryParams.set(name, value);
      }
    });

    const fullUrl = new URL(endpoint, window.location.origin);
    fullUrl.search = queryParams.toString();
    return fullUrl;
  }

  function showRequestUrl(url) {
    modalContent.querySelector(".urlDisplay")?.remove();

    const wrapper = document.createElement("div");
    wrapper.className = "urlDisplay mb-4 p-3 bg-gray-50 font-mono text-xs overflow-auto rounded-md";

    const content = document.createElement("div");
    content.className = "break-all";
    content.textContent = url;

    wrapper.appendChild(content);
    responseContainer.parentNode.insertBefore(wrapper, responseContainer);
  }

  function setResponseMeta(status, duration, ok) {
    responseStatus.textContent = String(status);
    responseStatus.className = ok
      ? "px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded mr-2"
      : "px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded mr-2";
    responseTime.textContent = `${duration}ms`;
  }

  function showTextResponse(text, isError = false) {
    responseData.innerHTML = "";

    const pre = document.createElement("pre");
    pre.className = isError
      ? "whitespace-pre-wrap break-words text-red-500 bg-gray-100 p-3 rounded-md"
      : "whitespace-pre-wrap break-words bg-gray-100 p-3 rounded-md";
    pre.textContent = text;
    responseData.appendChild(pre);
  }

  async function showBinaryResponse(response, contentType) {
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    responseData.innerHTML = "";

    if (contentType.includes("image/")) {
      const image = document.createElement("img");
      image.src = objectUrl;
      image.alt = "API response";
      image.className = "max-w-full h-auto rounded-md";
      responseData.appendChild(image);
      return;
    }

    if (contentType.includes("video/")) {
      const video = document.createElement("video");
      video.controls = true;
      video.src = objectUrl;
      video.className = "max-w-full rounded-md";
      responseData.appendChild(video);
      return;
    }

    if (contentType.includes("audio/")) {
      const audio = document.createElement("audio");
      audio.controls = true;
      audio.src = objectUrl;
      audio.className = "w-full rounded-md";
      responseData.appendChild(audio);
      return;
    }

    const download = document.createElement("a");
    download.href = objectUrl;
    download.download = "response-data";
    download.className =
      "inline-block px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors";
    download.textContent = `Unduh File (${formatNumber(blob.size)} bytes)`;
    responseData.appendChild(download);
  }

  async function executeApiRequest() {
    if (!activeEndpoint || !validateParams()) {
      return;
    }

    responseContainer.classList.remove("hidden");
    paramsContainer.classList.add("hidden");
    submitApiButton.classList.add("hidden");

    const fullUrl = buildRequestUrl();
    showRequestUrl(fullUrl.href);

    responseData.innerHTML =
      '<div class="text-center py-4"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div><p class="mt-2 text-gray-600">Loading...</p></div>';

    const startedAt = performance.now();

    try {
      const response = await fetch(fullUrl.href, {
        method: activeEndpoint.method,
        headers: {
          Accept: "application/json, text/plain, */*"
        }
      });

      const duration = Math.round(performance.now() - startedAt);
      setResponseMeta(response.status, duration, response.ok);

      const contentType = (response.headers.get("content-type") || "").toLowerCase();
      const isBinary = ["image/", "video/", "audio/", "application/octet-stream"]
        .some((type) => contentType.includes(type));

      if (isBinary) {
        await showBinaryResponse(response, contentType);
      } else if (contentType.includes("application/json")) {
        const data = await response.json();
        showTextResponse(JSON.stringify(data, null, 2), !response.ok);
      } else {
        showTextResponse(await response.text(), !response.ok);
      }
    } catch (error) {
      const duration = Math.round(performance.now() - startedAt);
      setResponseMeta("Error", duration, false);
      showTextResponse(`Error: ${error.message}`, true);
      console.error("API fetch error:", error);
    } finally {
      await Promise.allSettled([
        displayServerStatus(),
        displayUsageStats()
      ]);
    }
  }

  searchInput.addEventListener("input", renderFilteredEndpoints);
  searchButton.addEventListener("click", renderFilteredEndpoints);
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      renderFilteredEndpoints();
    }
  });

  closeModalButton.addEventListener("click", closeModal);
  modalBackdrop.addEventListener("click", closeModal);
  submitApiButton.addEventListener("click", executeApiRequest);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.classList.contains("hidden")) {
      closeModal();
    }
  });

  displayServerStatus();
  displayUsageStats();
  fetchAPIs();

  setInterval(() => {
    displayServerStatus();
    displayUsageStats();
  }, 15000);
});
