import {useCallback, useEffect, useState} from "react";
import {getFetchClient} from "@strapi/helper-plugin";
import {SingleSelect, SingleSelectOption} from '@strapi/design-system';
import { useQueryParams } from "@strapi/helper-plugin";
import {useParams} from "react-router-dom";
import {EditRouteParams} from "../pages/CreateOrEdit";

export interface I18nBaseQuery {
  plugins?: {
    i18n?: {
      locale?: string;
      relatedEntityId?: number;
    };
  };
}

export default function SelectLanguage({code}: {code?: string}) {
  const { id } = useParams<EditRouteParams>();
  const [displayedLocales, setDisplayedLocales] = useState([]);
  const [selected, setSelected] = useState<string>('');

  const [{ query }, setQuery] = useQueryParams<I18nBaseQuery>();

  useEffect(() => {
    if(code) {
      setSelected(code);
      setQuery({
        plugins: { ...query.plugins, i18n: {
            ...query.plugins?.i18n,
          locale: code
        } },
      });
    }
  }, [code]);

  const loadLocales = useCallback(async () => {
    const { get } = getFetchClient();
    try {
      const res = await get('/i18n/locales');
      setDisplayedLocales(res.data);
      const selectedCode = code ? code : (query.plugins?.i18n?.locale ? query.plugins.i18n.locale : (res.data[0]?.code || ''));
      setSelected(selectedCode);

      if (res.data[0]?.code || code) {
        setQuery({
          plugins: { ...query.plugins, i18n: {
            ...query.plugins?.i18n,
            locale: selectedCode
          } },
        });
      }
    } catch (err) {

    }
  }, [])

  useEffect(() => {
    loadLocales();
  }, []);

  const handleChange = (code: string) => {
    if (code === selected) {
      return;
    }

    setSelected(code);

    if(!id) {
      setQuery({
        plugins: { ...query.plugins, i18n: {
            ...query.plugins?.i18n,
          locale: code
        } },
      });
    } else {
      setQuery({
        plugins: { ...query.plugins, i18n: {
            locale: code,
            relatedEntityId: id
          } },
      });
    }
  };

  return <SingleSelect
    size="S"
    value={selected}
    onChange={handleChange}
  >
    {displayedLocales.map((locale) => (
      <SingleSelectOption key={locale.id} value={locale.code}>
        {locale.name}
      </SingleSelectOption>
    ))}
  </SingleSelect>
}
