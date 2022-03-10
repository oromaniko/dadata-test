/* eslint-disable camelcase */
/* eslint-disable quotes */

const normalize = ({
  data: {
    inn, kpp, type, name: { full_with_opf, short_with_opf }, address: { value },
  },
}) => ({
  type,
  name_short: short_with_opf,
  name_full: full_with_opf,
  inn_kpp: `${inn} / ${kpp}`,
  address: value,
});

const getSuggestions = async (query) => {
  const url = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party";
  const token = "b1d6585938aca44e65276e607bec03b916b24bf0";

  const options = {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify({ query }),
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
    return {};
  }
};

class PartyForm extends HTMLFormElement {
  constructor() {
    super();
    this.partyInput = this.querySelector('#party');
    this.typeString = this.querySelector('#type');
    this.requisites = this.querySelectorAll('.result input');
    this.datalist = this.querySelector('datalist');

    this.partyInput.addEventListener('input', async (event) => {
      const { value } = event.target;
      const { suggestions } = await getSuggestions(value);
      this.suggestions = suggestions;
      this.renderDatalist();
    });

    this.partyInput.addEventListener('change', (event) => {
      [this.selectedCompany] = this.suggestions
        .filter(({ value }) => value === event.target.value)
        .map(normalize);
      if (this.selectedCompany) {
        this.renderRequisites();
      }
    });
  }

  renderDatalist() {
    this.datalist.innerHTML = '';
    this.suggestions.forEach(({ value: name, data: { inn, address: { value } } }) => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = `${inn} ${value}`;
      this.datalist.append(option);
    });
  }

  renderRequisites() {
    this.typeString.textContent = this.selectedCompany.type;
    this.requisites.forEach((input) => {
      const { id } = input;
      input.value = this.selectedCompany[id];
    });
    this.partyInput.blur();
  }
}

customElements.define('party-form', PartyForm, { extends: 'form' });
