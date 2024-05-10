import {BaseHeaderLayout, Button, Typography, Box, Link, TextInput, Flex, JSONInput, TabGroup, Tabs, Tab, TabPanels, TabPanel} from '@strapi/design-system';
import {ArrowLeft} from "@strapi/icons";
import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";
import pluginId from "../../pluginId";
import {useHistory, useLocation, useParams} from 'react-router-dom';
import {getFetchClient, useQueryParams} from "@strapi/helper-plugin";
import Prism from "prismjs";
import 'prismjs/components/prism-jsx';
import 'prismjs/themes/prism-okaidia.css';
import Editor from 'react-simple-code-editor';
import {ITemplate} from "../HomePage";
import { createContext, useContextSelector } from 'use-context-selector';
import './style.css'
import SelectLanguage, {I18nBaseQuery} from "../../components/SelectLanguage";
import slugify from '@sindresorhus/slugify';

export interface EditRouteParams {
  id?: string;  // Define other route parameters as needed
}

function SaveButton() {
  const template = useContextSelector(EditContext, v => v.template);
  const [{ query }] = useQueryParams<I18nBaseQuery>();
  const { id } = useParams<EditRouteParams>();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const onSaveData = useCallback(async () => {
    setLoading(true);
    const { put, post } = getFetchClient();
    try {
      if(id) {
        await put('/content-manager/collection-types/plugin::strapi-react-email.react-email-template/' + id, template, {
          params: {
            locale: query.plugins?.i18n?.locale || undefined,
            relatedEntityId: query.plugins?.i18n?.relatedEntityId || undefined,
          }
        });
      } else {
        const {id, ...t} = template;
        const res = await post('/content-manager/collection-types/plugin::strapi-react-email.react-email-template', t, {
          params: {
            locale: query.plugins?.i18n?.locale || undefined,
            relatedEntityId: query.plugins?.i18n?.relatedEntityId || undefined,
          }
        });
        history.replace(`/plugins/${pluginId}/${res.data.id}`)
      }

      setSaveRequired(false);
    } catch (err) {

    }
    setLoading(false);
  }, [template])

  const saveRequired = useContextSelector(EditContext, v => v.saveRequired);
  const setSaveRequired = useContextSelector(EditContext, v => v.setSaveRequired);
  return <Button loading={loading} onClick={onSaveData} disabled={!saveRequired && !!id}>Save</Button>
}

function Preview() {
  const { id } = useParams<EditRouteParams>();
  const iframeRef = useRef(null);
  const template = useContextSelector(EditContext, v => v.template.originCode);
  const testData = useContextSelector(EditContext, v => v.template.testData);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      await testEmail();
    }, 300);
    return () => clearTimeout(timeout);
  }, [template, testData]);

  const testEmail = async () => {
    if (!id)
      return;
    const { put } = getFetchClient();
    try {
      const res = await put('/strapi-react-email/get-html/' + id, {template, testData});
      if(iframeRef.current) {
        iframeRef.current.srcdoc = res.data.html;
      }
    } catch (err: any) {
      if(iframeRef.current) {
        iframeRef.current.srcdoc = err.response?.data?.error?.details?.html || 'unknown error';
      }
    }
  }

  return <Flex direction='column' gap='2px' marginTop='10px'>
    {!id && <Typography>To see preview first save it</Typography>}

    <Box width='100%' color="neutral800" background="neutral0">
      <iframe style={{width: '100%', maxHeight: 500, height: 500}} ref={iframeRef}/>
    </Box>
  </Flex>
}

function TestEmail() {
  const { id } = useParams<EditRouteParams>();
  const [to, setTo] = useState('');
  const template = useContextSelector(EditContext, v => v.template.originCode);
  const testData = useContextSelector(EditContext, v => v.template.testData);
  const [loading, setLoading] = useState(false);

  const onclick = async () => {
    setLoading(true);
    try {
      const { put } = getFetchClient();
      await put('/strapi-react-email/send-test-email/' + id, {template, testData, to});
    } catch (err) {

    }
    setLoading(false);
  }

  if(!id) {
    return null;
  }

  return <Box width='100%'>
    <Flex gap='20px' alignItems='end'>
      <TextInput
        placeholder="Receiver email"
        label="Receiver" name="Receiver"
        onChange={(e: HTMLInputElement) => setTo(e.target.value)} value={to}/>
      <Button onClick={onclick} loading={loading}>Send email</Button>
    </Flex>
  </Box>
}

const NameAndSlug = () => {
  const setTemplate = useContextSelector(EditContext, v => v.setTemplate);
  const name = useContextSelector(EditContext, v => v.template.name);
  const isDefault = useContextSelector(EditContext, v => v.template.isDefault);

  return <Box width='100%'>
    <TextInput
      placeholder="Name of email template"
      label="Name" name="Name"
      disabled={isDefault}
      onChange={(e: HTMLInputElement) => setTemplate(s => ({...s, name: e.target.value, slug: slugify(e.target.value)}))} value={name || ''} />
  </Box>

}

const CreateOrEdit = () => {
  const { id } = useParams<EditRouteParams>();
  const code = useContextSelector(EditContext, v => v.template.originCode);
  const name = useContextSelector(EditContext, v => v.template.name);
  const slug = useContextSelector(EditContext, v => v.template.slug);
  const locale = useContextSelector(EditContext, v => v.template.locale);
  const subject = useContextSelector(EditContext, v => v.template.subject);
  const shipperName = useContextSelector(EditContext, v => v.template.shipperName);
  const shipperEmail = useContextSelector(EditContext, v => v.template.shipperEmail);
  const responseEmail = useContextSelector(EditContext, v => v.template.responseEmail);
  const testData = useContextSelector(EditContext, v => v.template.testData);

  const setTemplate = useContextSelector(EditContext, v => v.setTemplate);
  const [{ query }] = useQueryParams<I18nBaseQuery>();
  const history = useHistory();
  const location = useLocation();
  const [loading, setLoading]= useState(false);
  const localeIds = useContextSelector(EditContext, v => {
    return [{id: id ? id : query.plugins?.i18n?.relatedEntityId, locale}, ...(v.template.localizations || []).map(o => ({id: o.id, locale: o.locale}))];
  })
  const setSaveRequired = useContextSelector(EditContext, v => v.setSaveRequired);
  const previousLocale = useRef(query.plugins?.i18n?.locale);

  const loadData = async (entityId?: string) => {
    if (!entityId) {
      if(query.plugins?.i18n?.relatedEntityId) {
        const { post } = getFetchClient();
        setLoading(true);
        const res = await post('/i18n/content-manager/actions/get-non-localized-fields', {
          id: query.plugins?.i18n.relatedEntityId,
          locale: query.plugins?.i18n.locale,
          model: "plugin::strapi-react-email.react-email-template"
        });
        setTemplate(s => ({
          name: '',
          isDefault: false,
          originCode: '',
          responseEmail: '',
          shipperEmail: '',
          shipperName: '',
          subject: '',
          testData: '',
          locale: query.plugins?.i18n?.locale,
          ...res.data.nonLocalizedFields}));
        setLoading(false)
        return;
      } else {
        return;
      }
    }
    const { get } = getFetchClient();
    setLoading(true);
    try {
      const res = await get('/content-manager/collection-types/plugin::strapi-react-email.react-email-template/' + entityId);
      setTemplate(res.data);
    } catch (err) {

    }
    setLoading(false);
  }

  useEffect(() => {
    loadData(id);
  }, [id]);

  useEffect(() => {
    if(!query.plugins) {
      return;
    }
    if(previousLocale.current !== query.plugins?.i18n?.locale) {
      previousLocale.current = query.plugins?.i18n?.locale;
      onLanguageSelected(query.plugins?.i18n?.locale);
    }
  }, [query.plugins?.i18n?.locale]);

  const onLanguageSelected = (code: string) => {
    const foundedLocale = localeIds.find(o => o.locale === code);
    setSaveRequired(false);
    if(foundedLocale) {
      history.push(`/plugins/${pluginId}/${foundedLocale.id || 'create' }${location.search}`);
    } else {
      if(!id) {
        history.push(`/plugins/${pluginId}/${query.plugins.i18n.relatedEntityId || 'create'}${location.search}`)
      } else {
        history.push(`/plugins/${pluginId}/create${location.search}`);
      }
    }
  }

  return <Flex direction='column' alignItems='start' >
    <Box width='100%'>
      <BaseHeaderLayout
        navigationAction={<Link startIcon={<ArrowLeft />} to={`/plugins/${pluginId}`}>
          Go back
        </Link>}
        secondaryAction={<SelectLanguage onSelected={onLanguageSelected} code={locale}/>}
        primaryAction={<SaveButton/>}
        title={!id ? 'Create react email template' : id}></BaseHeaderLayout>
    </Box>
    <Box width='100%' paddingLeft='56px' paddingRight='56px' >
      <Box background="neutral0" hasRadius shadow="tableShadow" padding='20px' paddingTop='0px'>
        <Flex gap='20px' alignItems='start' >
          <Box style={{ flex: 1 }} width='100%'>
            <TabGroup label="Some stuff for the label" id="tabs">
              <Tabs>
                <Tab>Data</Tab>
                <Tab>Preview</Tab>
              </Tabs>
              <TabPanels>
                <TabPanel>
                  {!loading && <Flex direction='column' gap='20px'>
                    <NameAndSlug/>
                    <Box width='100%'>
                      <TextInput
                        placeholder="Subject"
                        label="Subject" name="Subject"
                        onChange={(e: HTMLInputElement) => setTemplate(s => ({...s, subject: e.target.value}))} value={subject || ''} />
                    </Box>
                    <Box width='100%'>
                      <TextInput
                        placeholder="Shipper name"
                        label="Shipper name" name="Shipper name"
                        onChange={(e: HTMLInputElement) => setTemplate(s => ({...s, shipperName: e.target.value}))} value={shipperName || ''} />
                    </Box>
                    <Box width='100%'>
                      <TextInput
                        placeholder="Shipper email"
                        label="Shipper email" name="Shipper email"
                        onChange={(e: HTMLInputElement) => setTemplate(s => ({...s, shipperEmail: e.target.value}))} value={shipperEmail || ''} />
                    </Box>
                    <Box width='100%'>
                      <TextInput
                        placeholder="Response email"
                        label="Response email" name="Response email"
                        onChange={(e: HTMLInputElement) => setTemplate(s => ({...s, responseEmail: e.target.value}))} value={responseEmail || ''} />
                    </Box>
                    <Box width='100%'>
                      <TextInput
                        placeholder="Slug"
                        label="Slug" name="Slug"
                        disabled
                        onChange={(e: HTMLInputElement) => setTemplate(s => ({...s, slug: e.target.value}))} value={slug || ''}
                      />
                    </Box>
                    <TestEmail/>
                  </Flex>}
                </TabPanel>
                <TabPanel>
                  <Preview/>
                </TabPanel>
              </TabPanels>
            </TabGroup>
            <Box marginTop='20px' width='100%'>
              <JSONInput onChange={(e: string) => setTemplate(s => ({...s, testData: e}))} label='Test data (JSON)' value={testData} />
            </Box>
          </Box>
          <Box style={{ maxWidth: 800, overflow: 'auto', maxHeight: '80vh', flex: 1, margin: '8px' }} background="neutral100" hasRadius shadow="tableShadow">
            <Typography>
              <Editor
                preClassName='code-editor'
                value={code || ''}
                onValueChange={code => setTemplate(s => ({...s, originCode: code}))}
                highlight={code => Prism.highlight(code, Prism.languages.jsx, 'jsx')}
                padding={10} />
            </Typography>
          </Box>
        </Flex>
      </Box>
    </Box>
  </Flex>
}

interface IContext {
  template: ITemplate;
  setTemplate: Dispatch<SetStateAction<ITemplate>>;
  saveRequired: boolean;
  setSaveRequired: (value: boolean) => void;
}



const EditContext = createContext<IContext>({
  setTemplate: () => null,
  // @ts-ignore
  template: {},
  saveRequired: false
})

function EditContextWrapper({children}: {children: ReactNode}) {
  const [template, setTemplate] = useState<ITemplate>({
    id: undefined,
    name: '',
    isDefault: false,
    originCode: '',
    responseEmail: '',
    shipperEmail: '',
    shipperName: '',
    subject: '',
    testData: '',
    slug: ''
  });
  const [saveRequired, setSaveRequired] = React.useState(false);
  const isFirstLoaded = useRef(0);

  useEffect(() => {
    if(isFirstLoaded.current > 1) {
      setSaveRequired(true);
    }
    isFirstLoaded.current++;
  }, [template]);

  return <EditContext.Provider value={{
    saveRequired,
    setSaveRequired: (value: boolean) => {
      setSaveRequired(value);
      isFirstLoaded.current = 1;
    },
    template,
    setTemplate
  }}>{children}</EditContext.Provider>
}

export default function () {
  return <EditContextWrapper>
    <CreateOrEdit/>
  </EditContextWrapper>
}

//navigationAction={<Link startIcon={<ArrowLeft />} to="/">
//             Go back
//           </Link>}
