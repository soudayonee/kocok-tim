(function () {
  "use strict";

  var STORAGE_KEY = "kocoktim_app_state_v1";

  const SAMPLE_PARTICIPANTS = [
    "Aditya Pratama",
    "Bagaskara Nindito",
    "Cantika Cahyaningrum",
    "Dimas Sasongko",
    "Elang Mahardika",
    "Fitri Handayani",
    "Guntur Wibowo",
    "Anindya Kusuma Putri",
    "Banyu Bening Tirta",
    "Cahya Ningrum Lestari",
    "Dika Wahyu Perdana",
    "Erlangga Satria Perkasa",
    "Farah Nur Azizah",
    "Galih Rakasiwi Putra",
    "Hesti Widiastuti Ningsih",
    "Indra Wijaya Kusuma",
    "Jatmiko Budi Santoso",
    "Kartika Sari Dewi",
    "Laksana Tri Kurniawan",
    "Mega Utami Putri",
    "Nugroho Adi Prasetyo",
    "Oka Raditya Mukti",
    "Panji Wisnu Wardhana",
    "Qonita Nurul Jannah",
    "Rangga Dwi Saputra",
    "Siti Aminah Rahmawati",
    "Taufik Hidayat Noor",
    "Utami Rizki Amelia",
    "Vino Gibran Bastian",
    "Wulan Guritno Sari",
    "Yusuf Bakhtiar Arif",
    "Zulfa Alya Mukhbita",
    "Achmad Fajar Nur Cahyo",
    "Bintang Ramadhan Putra Perkasa",
    "Dewi Ayu Sekar Kedaton",
    "Fathur Rahman Al Ghifari",
    "Gendis Manis Roro Jonggrang",
    "Hafizh Muhammad Rizky Noor",
    "I Gusti Ngurah Agung",
    "Kadek Ayu Laksmi Devi",
    "Muhammad Daffa Arya Putra",
    "Nabila Syifa Nur Salsabila",
    "Raden Roro Fitria Handayani",
    "Sultan Syarif Muhammad Alamsyah",
    "Tengku Mohammad Zaki Iskandar",
  ];

  var state = {
    theme: "light",
    participantsText: "",
    mode: "groupCount",
    splitValue: 4,
    prefix: "Kelompok",
    pickLeader: false,
    groups: [],
    lastUpdated: null,
    lastUnevenInfo: null,
    history: [],
  };

  var dom = {
    participantsTextarea: document.getElementById("participantsTextarea"),
    quickPersonInput: document.getElementById("quickPersonInput"),
    btnAddPerson: document.getElementById("btnAddPerson"),
    participantCountLabel: document.getElementById("participantCountLabel"),
    btnLoadSample: document.getElementById("btnLoadSample"),
    btnDedupe: document.getElementById("btnDedupe"),
    btnResetAll: document.getElementById("btnResetAll"),
    tabByGroupCount: document.getElementById("tabByGroupCount"),
    tabByMemberCount: document.getElementById("tabByMemberCount"),
    splitNumberInput: document.getElementById("splitNumberInput"),
    splitNumberLabel: document.getElementById("splitNumberLabel"),
    splitNumberSubhint: document.getElementById("splitNumberSubhint"),
    btnStepDown: document.getElementById("btnStepDown"),
    btnStepUp: document.getElementById("btnStepUp"),
    liveMathAlert: document.getElementById("liveMathAlert"),
    liveMathIcon: document.getElementById("liveMathIcon"),
    liveMathTitle: document.getElementById("liveMathTitle"),
    liveMathDesc: document.getElementById("liveMathDesc"),
    groupPrefixSelect: document.getElementById("groupPrefixSelect"),
    pickLeaderCheckbox: document.getElementById("pickLeaderCheckbox"),
    randomizerForm: document.getElementById("randomizerForm"),
    resultsSection: document.getElementById("resultsSection"),
    btnReshuffleOnly: document.getElementById("btnReshuffleOnly"),
    btnShuffleInsideGroups: document.getElementById("btnShuffleInsideGroups"),
    btnCopyResult: document.getElementById("btnCopyResult"),
    btnExportCsv: document.getElementById("btnExportCsv"),
    unevenNotificationBanner: document.getElementById(
      "unevenNotificationBanner",
    ),
    unevenBannerTitle: document.getElementById("unevenBannerTitle"),
    unevenBannerBody: document.getElementById("unevenBannerBody"),
    btnDismissUnevenBanner: document.getElementById("btnDismissUnevenBanner"),
    groupsOutputContainer: document.getElementById("groupsOutputContainer"),
    lastShuffledTime: document.getElementById("lastShuffledTime"),
    historyListContainer: document.getElementById("historyListContainer"),
    historyCountBadge: document.getElementById("historyCountBadge"),
    btnClearHistory: document.getElementById("btnClearHistory"),
    btnToggleTheme: document.getElementById("btnToggleTheme"),
    themeIcon: document.getElementById("themeIcon"),
    themeLabel: document.getElementById("themeLabel"),
    unevenConfirmModal: document.getElementById("unevenConfirmModal"),
    modalIconBadge: document.getElementById("modalIconBadge"),
    modalUnevenTitle: document.getElementById("modalUnevenTitle"),
    modalUnevenLead: document.getElementById("modalUnevenLead"),
    modalUnevenBreakdown: document.getElementById("modalUnevenBreakdown"),
    btnCancelUneven: document.getElementById("btnCancelUneven"),
    btnProceedUneven: document.getElementById("btnProceedUneven"),
    toastContainer: document.getElementById("toastContainer"),
  };

  function saveStateToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {}
  }

  function loadStateFromStorage() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      var parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        state.theme = parsed.theme === "dark" ? "dark" : "light";
        state.participantsText =
          typeof parsed.participantsText === "string"
            ? parsed.participantsText
            : "";
        state.mode =
          parsed.mode === "memberCount" ? "memberCount" : "groupCount";
        state.splitValue = Math.max(1, parseInt(parsed.splitValue, 10) || 4);
        state.prefix = parsed.prefix || "Kelompok";
        state.pickLeader = Boolean(parsed.pickLeader);
        state.groups = Array.isArray(parsed.groups) ? parsed.groups : [];
        state.lastUpdated = parsed.lastUpdated || null;
        state.lastUnevenInfo = parsed.lastUnevenInfo || null;
        state.history = Array.isArray(parsed.history)
          ? parsed.history.slice(0, 8)
          : [];
        return true;
      }
    } catch (err) {
      return false;
    }
    return false;
  }

  function parseParticipants(rawText) {
    if (!rawText) return [];
    return rawText
      .split(/[\r\n,]+/)
      .map(function (item) {
        return item.trim();
      })
      .filter(function (item) {
        return item.length > 0;
      });
  }

  function fisherYatesShuffle(arr) {
    var copy = arr.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }

  function getSampleParticipantsForCurrentSettings() {
    var splitValue = Math.max(1, parseInt(state.splitValue, 10) || 1);
    var sampleCount = Math.min(
      SAMPLE_PARTICIPANTS.length,
      splitValue * 4,
    );

    sampleCount =
      Math.floor(sampleCount / splitValue) * splitValue;

    if (sampleCount === 0) {
      sampleCount = Math.min(SAMPLE_PARTICIPANTS.length, splitValue);
    }

    return fisherYatesShuffle(SAMPLE_PARTICIPANTS).slice(0, sampleCount);
  }

  function calculateDistribution(totalPeople, mode, splitVal) {
    var val = Math.max(1, parseInt(splitVal, 10) || 1);

    if (totalPeople === 0) {
      return {
        valid: false,
        totalPeople: 0,
        numGroups: 0,
        isUneven: false,
        title: "Daftar peserta masih kosong",
        message:
          "Masukkan minimal 2 nama peserta untuk mulai membagi kelompok.",
      };
    }

    if (mode === "groupCount") {
      if (val > totalPeople) {
        return {
          valid: false,
          totalPeople: totalPeople,
          numGroups: val,
          isUneven: true,
          title: "Jumlah kelompok melebihi jumlah peserta",
          message:
            "Terdapat " +
            totalPeople +
            " peserta namun diminta " +
            val +
            " kelompok. Kurangi jumlah kelompok atau tambahkan peserta.",
        };
      }

      var baseSize = Math.floor(totalPeople / val);
      var remainder = totalPeople % val;
      var isUneven = remainder !== 0;

      if (!isUneven) {
        return {
          valid: true,
          totalPeople: totalPeople,
          numGroups: val,
          isUneven: false,
          title: "Pembagian Sama Rata",
          message:
            "Akan terbentuk " +
            val +
            " kelompok dengan masing-masing " +
            baseSize +
            " anggota.",
        };
      } else {
        var largerSize = baseSize + 1;
        var largerCount = remainder;
        var smallerCount = val - remainder;
        return {
          valid: true,
          totalPeople: totalPeople,
          numGroups: val,
          isUneven: true,
          title: "Anggota tiap kelompok tidak sama rata",
          message:
            "Dari " +
            totalPeople +
            " peserta untuk " +
            val +
            " kelompok, akan ada " +
            largerCount +
            " kelompok berisi " +
            largerSize +
            " orang dan " +
            smallerCount +
            " kelompok berisi " +
            baseSize +
            " orang.",
        };
      }
    } else {
      var targetPerGroup = val;
      var totalGroups = Math.ceil(totalPeople / targetPerGroup);
      var remainderMembers = totalPeople % targetPerGroup;
      var isUnevenTarget = remainderMembers !== 0;

      if (!isUnevenTarget) {
        return {
          valid: true,
          totalPeople: totalPeople,
          numGroups: totalGroups,
          isUneven: false,
          title: "Pembagian Sama Rata",
          message:
            "Akan terbentuk " +
            totalGroups +
            " kelompok dengan masing-masing " +
            targetPerGroup +
            " anggota.",
        };
      } else {
        var fullGroups = Math.floor(totalPeople / targetPerGroup);
        return {
          valid: true,
          totalPeople: totalPeople,
          numGroups: totalGroups,
          isUneven: true,
          title: "Anggota tiap kelompok tidak sama rata",
          message:
            "Dengan kapasitas " +
            targetPerGroup +
            " orang per kelompok, akan terbentuk " +
            fullGroups +
            " kelompok berisi " +
            targetPerGroup +
            " orang dan 1 kelompok berisi " +
            remainderMembers +
            " orang.",
        };
      }
    }
  }

  function makeGroupName(prefix, index) {
    if (prefix === "Tim") {
      var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      var letter = index < alphabet.length ? alphabet[index] : index + 1;
      return "Tim " + letter;
    }
    return prefix + " " + (index + 1);
  }

  function showToast(message) {
    var toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    dom.toastContainer.appendChild(toast);
    setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 3800);
  }

  function scrollToResults() {
    if (!dom.resultsSection) return;
    dom.resultsSection.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    dom.resultsSection.classList.remove("results-flash");
    void dom.resultsSection.offsetWidth;
    dom.resultsSection.classList.add("results-flash");
  }

  var MODAL_ICONS = {
    alert:
      '<svg class="icon-svg icon-svg-xl" viewBox="0 0 24 24"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>',
    trash:
      '<svg class="icon-svg icon-svg-xl" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>',
    shuffle:
      '<svg class="icon-svg icon-svg-xl" viewBox="0 0 24 24"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>',
    filter:
      '<svg class="icon-svg icon-svg-xl" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M7 12h10"/><path d="M10 18h4"/></svg>',
    file: '<svg class="icon-svg icon-svg-xl" viewBox="0 0 24 24"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>',
  };

  var activeModalConfirmCallback = null;

  function openConfirmModal(opts) {
    var variant = opts.variant || "warning";
    var iconKey = opts.icon || "alert";

    dom.modalIconBadge.className =
      "modal-icon-badge" +
      (variant === "danger"
        ? " badge-danger"
        : variant === "primary"
          ? " badge-primary"
          : "");
    dom.modalIconBadge.innerHTML = MODAL_ICONS[iconKey] || MODAL_ICONS.alert;

    dom.modalUnevenTitle.textContent = opts.title || "Konfirmasi Tindakan";
    dom.modalUnevenLead.textContent = opts.lead || "";

    if (opts.detail) {
      dom.modalUnevenBreakdown.style.display = "block";
      dom.modalUnevenBreakdown.textContent = opts.detail;
    } else {
      dom.modalUnevenBreakdown.style.display = "none";
      dom.modalUnevenBreakdown.textContent = "";
    }

    dom.btnCancelUneven.textContent = opts.cancelText || "Batal";
    dom.btnProceedUneven.textContent = opts.confirmText || "Lanjutkan";
    dom.btnProceedUneven.className =
      "btn " +
      (variant === "danger"
        ? "btn-danger"
        : variant === "primary"
          ? "btn-confirm-primary"
          : "btn-warning");

    activeModalConfirmCallback =
      typeof opts.onConfirm === "function" ? opts.onConfirm : null;
    dom.unevenConfirmModal.classList.add("open");
    dom.btnProceedUneven.focus();
  }

  function closeConfirmModal() {
    dom.unevenConfirmModal.classList.remove("open");
    activeModalConfirmCallback = null;
  }

  function requestGenerateGroups(isReshuffleAll) {
    var people = parseParticipants(state.participantsText);
    var dist = calculateDistribution(
      people.length,
      state.mode,
      state.splitValue,
    );

    if (!dist.valid) {
      showToast(dist.message);
      return;
    }

    if (isReshuffleAll && state.groups && state.groups.length > 0) {
      openConfirmModal({
        variant: dist.isUneven ? "warning" : "primary",
        icon: "shuffle",
        title: "Acak Ulang Seluruh Kelompok?",
        lead: "Susunan kelompok yang sedang tampil saat ini akan dirombak dan diacak ulang dari awal.",
        detail: dist.isUneven
          ? "Perhatian: " + dist.message
          : "Total " +
            people.length +
            " peserta akan dibagi merata ke dalam " +
            dist.numGroups +
            " kelompok.",
        cancelText: "Batal",
        confirmText: "Ya, Acak Ulang Semua",
        onConfirm: function () {
          executeGenerateGroups(true, true);
        },
      });
      return;
    }

    if (dist.isUneven) {
      openConfirmModal({
        variant: "warning",
        icon: "alert",
        title: "Jumlah Anggota Tidak Sama Rata",
        lead:
          "Anda memasukkan " +
          people.length +
          " peserta, sehingga jumlah anggota di setiap kelompok tidak bisa dibagi sama rata.",
        detail: dist.message,
        cancelText: "Atur Ulang",
        confirmText: "Tetap Lanjutkan & Acak",
        onConfirm: function () {
          executeGenerateGroups(true, true);
        },
      });
      return;
    }

    executeGenerateGroups(true, true);
  }

  function executeGenerateGroups(recordHistory, shouldScroll) {
    var people = parseParticipants(state.participantsText);
    var dist = calculateDistribution(
      people.length,
      state.mode,
      state.splitValue,
    );
    if (people.length === 0) return;

    var shuffledPeople = fisherYatesShuffle(people);
    var numGroups = Math.max(
      1,
      Math.min(dist.numGroups, shuffledPeople.length),
    );
    var createdGroups = [];

    if (state.mode === "groupCount") {
      for (var g = 0; g < numGroups; g++) {
        createdGroups.push({
          id: "grp-" + Date.now() + "-" + g,
          name: makeGroupName(state.prefix, g),
          members: [],
          leaderIndex: 0,
        });
      }

      for (var i = 0; i < shuffledPeople.length; i++) {
        createdGroups[i % numGroups].members.push(shuffledPeople[i]);
      }

      createdGroups = fisherYatesShuffle(createdGroups).map(
        function (grp, idx) {
          var reshuffledMembers = fisherYatesShuffle(grp.members);
          return {
            id: grp.id,
            name: makeGroupName(state.prefix, idx),
            members: reshuffledMembers,
            leaderIndex: Math.floor(Math.random() * reshuffledMembers.length),
          };
        },
      );
    } else {
      var perGroup = Math.max(1, parseInt(state.splitValue, 10) || 2);
      var groupIdx = 0;
      for (var m = 0; m < shuffledPeople.length; m += perGroup) {
        var slice = fisherYatesShuffle(shuffledPeople.slice(m, m + perGroup));
        createdGroups.push({
          id: "grp-" + Date.now() + "-" + groupIdx,
          name: makeGroupName(state.prefix, groupIdx),
          members: slice,
          leaderIndex: Math.floor(Math.random() * slice.length),
        });
        groupIdx++;
      }
    }

    var nowFormatted = new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    state.groups = createdGroups;
    state.lastUpdated = nowFormatted;
    state.lastUnevenInfo = dist.isUneven
      ? {
          title: "Distribusi Tidak Sama Rata: ",
          message: dist.message,
        }
      : null;

    if (recordHistory) {
      state.history.unshift({
        id: "hist-" + Date.now(),
        time: nowFormatted,
        participantCount: people.length,
        groupCount: createdGroups.length,
        isUneven: dist.isUneven,
        groups: JSON.parse(JSON.stringify(createdGroups)),
      });
      if (state.history.length > 8) {
        state.history = state.history.slice(0, 8);
      }
    }

    saveStateToStorage();
    renderAll();

    if (shouldScroll) {
      setTimeout(scrollToResults, 60);
    }
  }

  function shuffleInsideExistingGroups() {
    if (!state.groups || state.groups.length === 0) return;
    state.groups.forEach(function (grp) {
      grp.members = fisherYatesShuffle(grp.members);
      grp.leaderIndex = Math.floor(Math.random() * grp.members.length);
    });
    state.lastUpdated = new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    saveStateToStorage();
    renderGroupsOutput();
    showToast("Urutan anggota di tiap kelompok berhasil diacak ulang.");
  }

  function renderConfigAndMath() {
    var people = parseParticipants(state.participantsText);
    dom.participantCountLabel.textContent = people.length + " orang";

    var isGroupMode = state.mode === "groupCount";
    dom.tabByGroupCount.classList.toggle("active", isGroupMode);
    dom.tabByGroupCount.setAttribute(
      "aria-selected",
      isGroupMode ? "true" : "false",
    );
    dom.tabByMemberCount.classList.toggle("active", !isGroupMode);
    dom.tabByMemberCount.setAttribute(
      "aria-selected",
      !isGroupMode ? "true" : "false",
    );

    dom.splitNumberLabel.textContent = isGroupMode
      ? "Jumlah Kelompok"
      : "Anggota per Kelompok";
    dom.splitNumberSubhint.textContent = isGroupMode
      ? "Total kelompok yang ingin dibentuk"
      : "Kapasitas orang di setiap kelompok";

    dom.splitNumberInput.value = state.splitValue;
    dom.groupPrefixSelect.value = state.prefix;
    dom.pickLeaderCheckbox.checked = state.pickLeader;

    var dist = calculateDistribution(
      people.length,
      state.mode,
      state.splitValue,
    );
    dom.liveMathAlert.className =
      "balance-preview " +
      (dist.isUneven || !dist.valid ? "is-uneven" : "is-even");
    dom.liveMathIcon.innerHTML =
      dist.isUneven || !dist.valid
        ? '<svg class="icon-svg icon-svg-sm" viewBox="0 0 24 24"><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>'
        : '<svg class="icon-svg icon-svg-sm" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>';
    dom.liveMathTitle.textContent = dist.title;
    dom.liveMathDesc.textContent = dist.message;
  }

  function renderGroupsOutput() {
    dom.groupsOutputContainer.innerHTML = "";

    if (state.lastUpdated) {
      dom.lastShuffledTime.textContent = "Diacak pukul " + state.lastUpdated;
    } else {
      dom.lastShuffledTime.textContent = "Siap diacak";
    }

    if (state.lastUnevenInfo) {
      dom.unevenNotificationBanner.classList.add("visible");
      dom.unevenBannerBody.textContent = state.lastUnevenInfo.message;
    } else {
      dom.unevenNotificationBanner.classList.remove("visible");
    }

    if (!state.groups || state.groups.length === 0) {
      var empty = document.createElement("div");
      empty.style.gridColumn = "1 / -1";
      empty.style.textAlign = "center";
      empty.style.padding = "36px 20px";
      empty.style.background = "var(--bg-surface)";
      empty.style.border = "1px dashed var(--border-color)";
      empty.style.borderRadius = "var(--radius-md)";
      empty.style.color = "var(--text-secondary)";
      empty.textContent =
        'Belum ada kelompok yang ditampilkan. Masukkan daftar nama di atas lalu klik "Acak & Buat Kelompok".';
      dom.groupsOutputContainer.appendChild(empty);
      return;
    }

    var sizes = state.groups.map(function (g) {
      return g.members.length;
    });
    var maxSize = Math.max.apply(null, sizes);
    var minSize = Math.min.apply(null, sizes);
    var hasDiff = maxSize !== minSize;

    state.groups.forEach(function (group, gIndex) {
      var card = document.createElement("article");
      var isSmaller = hasDiff && group.members.length === minSize;
      card.className = "group-card" + (isSmaller ? " is-smaller" : "");
      card.style.animationDelay = gIndex * 0.03 + "s";

      var head = document.createElement("header");
      head.className = "group-card-head";

      var titleInput = document.createElement("input");
      titleInput.type = "text";
      titleInput.className = "group-title-input";
      titleInput.value = group.name;
      titleInput.setAttribute("aria-label", "Ubah nama " + group.name);
      titleInput.addEventListener("change", function (e) {
        var val = e.target.value.trim() || makeGroupName(state.prefix, gIndex);
        state.groups[gIndex].name = val;
        e.target.value = val;
        saveStateToStorage();
      });

      var badge = document.createElement("span");
      badge.className = "member-count-tag";
      badge.textContent = group.members.length + " orang";

      head.appendChild(titleInput);
      head.appendChild(badge);

      var list = document.createElement("ol");
      list.className = "member-list";

      group.members.forEach(function (member, mIndex) {
        var li = document.createElement("li");
        li.className = "member-row";

        var info = document.createElement("div");
        info.className = "member-info";

        var idxSpan = document.createElement("span");
        idxSpan.className = "member-idx";
        idxSpan.textContent = mIndex + 1 + ".";

        var nameSpan = document.createElement("span");
        nameSpan.className = "member-name";
        nameSpan.textContent = member;

        info.appendChild(idxSpan);
        info.appendChild(nameSpan);
        li.appendChild(info);

        if (state.pickLeader && mIndex === (group.leaderIndex || 0)) {
          var lead = document.createElement("span");
          lead.className = "leader-pill";
          lead.style.display = "inline-flex";
          lead.style.alignItems = "center";
          lead.style.gap = "4px";
          lead.innerHTML =
            '<svg class="icon-svg icon-svg-sm" style="width:12px;height:12px;" viewBox="0 0 24 24" aria-hidden="true"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg><span>Ketua</span>';
          li.appendChild(lead);
        }

        list.appendChild(li);
      });

      card.appendChild(head);
      card.appendChild(list);
      dom.groupsOutputContainer.appendChild(card);
    });
  }

  function renderHistory() {
    dom.historyListContainer.innerHTML = "";
    var count = state.history ? state.history.length : 0;
    dom.historyCountBadge.textContent = String(count);

    if (count === 0) {
      var emptyMsg = document.createElement("p");
      emptyMsg.style.fontSize = "0.8rem";
      emptyMsg.style.color = "var(--text-muted)";
      emptyMsg.style.marginTop = "8px";
      emptyMsg.textContent = "Belum ada riwayat pengacakan.";
      dom.historyListContainer.appendChild(emptyMsg);
      return;
    }

    state.history.forEach(function (item, idx) {
      var box = document.createElement("div");
      box.className = "history-card";

      var top = document.createElement("div");
      top.style.display = "flex";
      top.style.justifyContent = "space-between";
      top.style.color = "var(--text-muted)";
      top.style.fontSize = "0.73rem";
      top.innerHTML =
        "<span>#" + (count - idx) + "</span><time>" + item.time + "</time>";

      var label = document.createElement("div");
      label.style.fontWeight = "600";
      label.textContent =
        item.participantCount + " peserta → " + item.groupCount + " kelompok";

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-sm";
      btn.style.marginTop = "4px";
      btn.textContent = "Tampilkan Hasil Ini";
      btn.addEventListener("click", function () {
        openConfirmModal({
          variant: "primary",
          icon: "shuffle",
          title: "Pulihkan Hasil Undian Ini?",
          lead:
            "Tampilan kelompok saat ini akan digantikan oleh hasil undian dari pukul " +
            item.time +
            ".",
          detail:
            item.participantCount +
            " peserta dalam " +
            item.groupCount +
            " kelompok akan dimuat kembali.",
          cancelText: "Batal",
          confirmText: "Ya, Tampilkan",
          onConfirm: function () {
            state.groups = JSON.parse(JSON.stringify(item.groups));
            state.lastUpdated = item.time + " (Riwayat)";
            saveStateToStorage();
            renderGroupsOutput();
            scrollToResults();
            showToast(
              "Hasil undian pukul " + item.time + " ditampilkan kembali.",
            );
          },
        });
      });

      box.appendChild(top);
      box.appendChild(label);
      box.appendChild(btn);
      dom.historyListContainer.appendChild(box);
    });
  }

  function applyTheme() {
    document.documentElement.setAttribute("data-theme", state.theme);
    if (state.theme === "dark") {
      dom.themeIcon.innerHTML =
        '<svg class="icon-svg icon-svg-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>';
      dom.themeLabel.textContent = "Terang";
    } else {
      dom.themeIcon.innerHTML =
        '<svg class="icon-svg icon-svg-sm" viewBox="0 0 24 24"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
      dom.themeLabel.textContent = "Gelap";
    }
  }

  function renderAll() {
    applyTheme();
    renderConfigAndMath();
    renderGroupsOutput();
    renderHistory();
  }

  function addSinglePerson() {
    var val = dom.quickPersonInput.value.trim();
    if (!val) return;
    var current = parseParticipants(state.participantsText);
    current.push(val);
    state.participantsText = current.join("\n");
    dom.participantsTextarea.value = state.participantsText;
    dom.quickPersonInput.value = "";
    saveStateToStorage();
    renderConfigAndMath();
  }

  function copyGroupsToClipboard() {
    if (!state.groups || state.groups.length === 0) return;
    var lines = ["HASIL PEMBAGIAN KELOMPOK"];
    if (state.lastUnevenInfo) {
      lines.push("Catatan: " + state.lastUnevenInfo.message);
    }
    lines.push("");

    state.groups.forEach(function (grp) {
      lines.push(grp.name + " (" + grp.members.length + " orang):");
      grp.members.forEach(function (m, idx) {
        var isLead = state.pickLeader && idx === grp.leaderIndex;
        lines.push(idx + 1 + ". " + m + (isLead ? " (Ketua)" : ""));
      });
      lines.push("");
    });

    var text = lines.join("\n").trim();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(function () {
          showToast("Hasil kelompok berhasil disalin ke clipboard.");
        })
        .catch(function () {
          fallbackCopy(text);
        });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      showToast("Hasil kelompok berhasil disalin ke clipboard.");
    } catch (err) {
      showToast("Gagal menyalin otomatis.");
    }
    document.body.removeChild(ta);
  }

  function exportGroupsToCsv() {
    if (!state.groups || state.groups.length === 0) return;
    var rows = [["Kelompok", "No", "Nama Anggota", "Peran"]];
    state.groups.forEach(function (grp) {
      grp.members.forEach(function (m, idx) {
        var role =
          state.pickLeader && idx === grp.leaderIndex ? "Ketua" : "Anggota";
        rows.push([
          '"' + grp.name.replace(/"/g, '""') + '"',
          String(idx + 1),
          '"' + m.replace(/"/g, '""') + '"',
          role,
        ]);
      });
    });
    var csv = rows
      .map(function (r) {
        return r.join(",");
      })
      .join("\n");
    var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "hasil-kelompok.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("File CSV berhasil diunduh.");
  }

  dom.participantsTextarea.addEventListener("input", function (e) {
    state.participantsText = e.target.value;
    saveStateToStorage();
    renderConfigAndMath();
  });
  dom.participantsTextarea.addEventListener("keydown", function (e) {
    if (e.ctrlKey && e.key === "Enter") {
      e.preventDefault();
      requestGenerateGroups(false);
    }
  });

  dom.btnAddPerson.addEventListener("click", addSinglePerson);
  dom.quickPersonInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addSinglePerson();
    }
  });

  dom.btnLoadSample.addEventListener("click", function () {
    var currentList = parseParticipants(state.participantsText);
    if (currentList.length > 0) {
      openConfirmModal({
        variant: "warning",
        icon: "file",
        title: "Ganti dengan Daftar Contoh?",
        lead:
          "Daftar berisi " +
          currentList.length +
          " nama peserta yang ada saat ini akan digantikan oleh daftar nama contoh.",
        detail:
          "Pastikan Anda sudah menyalin daftar nama jika masih diperlukan.",
        cancelText: "Batal",
        confirmText: "Ya, Muat Contoh",
        onConfirm: function () {
          state.participantsText =
            getSampleParticipantsForCurrentSettings().join("\n");
          dom.participantsTextarea.value = state.participantsText;
          saveStateToStorage();
          renderConfigAndMath();
          showToast("Daftar nama contoh yang sudah diacak dimuat.");
        },
      });
    } else {
      state.participantsText =
        getSampleParticipantsForCurrentSettings().join("\n");
      dom.participantsTextarea.value = state.participantsText;
      saveStateToStorage();
      renderConfigAndMath();
      showToast("Daftar nama contoh yang sudah diacak dimuat.");
    }
  });

  dom.btnDedupe.addEventListener("click", function () {
    var list = parseParticipants(state.participantsText);
    var seen = {};
    var unique = [];
    var duplicates = [];
    list.forEach(function (name) {
      var k = name.toLowerCase();
      if (!seen[k]) {
        seen[k] = true;
        unique.push(name);
      } else {
        duplicates.push(name);
      }
    });
    var diff = list.length - unique.length;
    if (diff === 0) {
      showToast("Tidak ditemukan nama ganda pada daftar peserta.");
      return;
    }
    openConfirmModal({
      variant: "warning",
      icon: "filter",
      title: "Hapus " + diff + " Nama Ganda?",
      lead: "Sistem menemukan nama yang tertulis lebih dari satu kali di dalam daftar peserta Anda.",
      detail: "Nama ganda yang akan dihapus: " + duplicates.join(", "),
      cancelText: "Batal",
      confirmText: "Ya, Hapus Nama Ganda",
      onConfirm: function () {
        state.participantsText = unique.join("\n");
        dom.participantsTextarea.value = state.participantsText;
        saveStateToStorage();
        renderConfigAndMath();
        showToast(diff + " nama ganda berhasil dihapus.");
      },
    });
  });

  dom.btnResetAll.addEventListener("click", function () {
    var list = parseParticipants(state.participantsText);
    var hasGroups = state.groups && state.groups.length > 0;
    if (list.length === 0 && !hasGroups) {
      showToast("Daftar peserta sudah kosong.");
      return;
    }
    openConfirmModal({
      variant: "danger",
      icon: "trash",
      title: "Kosongkan Semua Data Aktif?",
      lead: "Tindakan ini akan menghapus seluruh daftar nama peserta beserta susunan kelompok yang sedang tampil.",
      detail:
        "Terdapat " +
        list.length +
        " nama peserta" +
        (hasGroups ? " dan " + state.groups.length + " kelompok aktif" : "") +
        " yang akan dikosongkan.",
      cancelText: "Batal",
      confirmText: "Ya, Kosongkan Semua",
      onConfirm: function () {
        state.participantsText = "";
        state.groups = [];
        state.lastUpdated = null;
        state.lastUnevenInfo = null;
        dom.participantsTextarea.value = "";
        saveStateToStorage();
        renderAll();
        showToast("Daftar peserta dan kelompok aktif telah dikosongkan.");
      },
    });
  });

  dom.tabByGroupCount.addEventListener("click", function () {
    state.mode = "groupCount";
    saveStateToStorage();
    renderConfigAndMath();
  });

  dom.tabByMemberCount.addEventListener("click", function () {
    state.mode = "memberCount";
    saveStateToStorage();
    renderConfigAndMath();
  });

  dom.btnStepDown.addEventListener("click", function () {
    state.splitValue = Math.max(1, (parseInt(state.splitValue, 10) || 2) - 1);
    saveStateToStorage();
    renderConfigAndMath();
  });

  dom.btnStepUp.addEventListener("click", function () {
    state.splitValue = Math.min(100, (parseInt(state.splitValue, 10) || 1) + 1);
    saveStateToStorage();
    renderConfigAndMath();
  });

  dom.splitNumberInput.addEventListener("input", function (e) {
    var val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1) {
      state.splitValue = Math.min(100, val);
      saveStateToStorage();
      renderConfigAndMath();
    }
  });

  dom.groupPrefixSelect.addEventListener("change", function (e) {
    state.prefix = e.target.value;
    if (state.groups && state.groups.length > 0) {
      state.groups.forEach(function (grp, idx) {
        grp.name = makeGroupName(state.prefix, idx);
      });
    }
    saveStateToStorage();
    renderGroupsOutput();
  });

  dom.pickLeaderCheckbox.addEventListener("change", function (e) {
    state.pickLeader = e.target.checked;
    saveStateToStorage();
    renderGroupsOutput();
  });

  dom.randomizerForm.addEventListener("submit", function (e) {
    e.preventDefault();
    requestGenerateGroups(false);
  });

  dom.btnReshuffleOnly.addEventListener("click", function () {
    requestGenerateGroups(true);
  });

  dom.btnShuffleInsideGroups.addEventListener("click", function () {
    if (!state.groups || state.groups.length === 0) {
      showToast("Belum ada kelompok untuk diacak urutannya.");
      return;
    }
    openConfirmModal({
      variant: "primary",
      icon: "shuffle",
      title: "Acak Urutan Internal Kelompok?",
      lead: "Urutan nomor anggota (serta ketua tim jika aktif) di dalam masing-masing kelompok akan dikocok ulang.",
      detail:
        "Anggota tidak akan berpindah ke kelompok lain, hanya posisi urutannya saja yang diacak.",
      cancelText: "Batal",
      confirmText: "Ya, Acak Urutan Internal",
      onConfirm: function () {
        shuffleInsideExistingGroups();
      },
    });
  });

  dom.btnCancelUneven.addEventListener("click", closeConfirmModal);
  dom.btnProceedUneven.addEventListener("click", function () {
    var cb = activeModalConfirmCallback;
    closeConfirmModal();
    if (typeof cb === "function") {
      cb();
    }
  });
  dom.unevenConfirmModal.addEventListener("click", function (e) {
    if (e.target === dom.unevenConfirmModal) {
      closeConfirmModal();
    }
  });
  document.addEventListener("keydown", function (e) {
    if (
      e.key === "Escape" &&
      dom.unevenConfirmModal.classList.contains("open")
    ) {
      closeConfirmModal();
    }
  });

  dom.btnDismissUnevenBanner.addEventListener("click", function () {
    dom.unevenNotificationBanner.classList.remove("visible");
  });

  dom.btnCopyResult.addEventListener("click", copyGroupsToClipboard);
  dom.btnExportCsv.addEventListener("click", exportGroupsToCsv);

  dom.btnClearHistory.addEventListener("click", function () {
    if (!state.history || state.history.length === 0) {
      showToast("Riwayat undian sudah kosong.");
      return;
    }
    openConfirmModal({
      variant: "danger",
      icon: "trash",
      title: "Hapus Seluruh Riwayat Undian?",
      lead: "Semua catatan hasil pengacakan sebelumnya yang tersimpan di LocalStorage akan dihapus permanen.",
      detail:
        "Terdapat " +
        state.history.length +
        " riwayat undian tersimpan yang akan dihapus.",
      cancelText: "Batal",
      confirmText: "Ya, Hapus Riwayat",
      onConfirm: function () {
        state.history = [];
        saveStateToStorage();
        renderHistory();
        showToast("Riwayat undian berhasil dihapus.");
      },
    });
  });

  dom.btnToggleTheme.addEventListener("click", function () {
    state.theme = state.theme === "dark" ? "light" : "dark";
    saveStateToStorage();
    applyTheme();
  });

  var loaded = loadStateFromStorage();
  dom.participantsTextarea.value = state.participantsText;
  if (loaded && state.groups && state.groups.length > 0) {
    renderAll();
  } else {
    renderConfigAndMath();
    renderGroupsOutput();
    renderHistory();
  }
})();
