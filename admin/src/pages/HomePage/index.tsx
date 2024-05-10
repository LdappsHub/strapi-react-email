/*
 *
 * HomePage
 *
 */
import { createContext, useContextSelector } from 'use-context-selector';
import React, {useEffect, useState, ReactNode, Dispatch, SetStateAction, useCallback} from 'react';
import { Box,
  Status,
  ActionLayout,
  BaseHeaderLayout,
  Typography,
  Loader,
  Table,
  Thead,
  Dialog,
  DialogBody,
  DialogFooter,
  Tbody, Tr, Td, Th, VisuallyHidden, BaseCheckbox, Flex, IconButton, Button} from '@strapi/design-system';
import {getFetchClient, InjectionZone, PageSizeURLQuery, useQueryParams} from "@strapi/helper-plugin";
import {Pencil, Plus, Trash} from "@strapi/icons";
import { PaginationURLQuery } from '@strapi/helper-plugin';
import { useHistory, useLocation, Link as ReactRouterLink } from 'react-router-dom';
import { ExclamationMarkCircle } from '@strapi/icons';
import SelectLanguage, {I18nBaseQuery} from "../../components/SelectLanguage";


function DeleteItem ({onDelete}: {onDelete: () => void}) {
  const [isVisible, setIsVisible] = useState(false);
  return <>
    <IconButton onClick={() => setIsVisible(true)} label="Delete" noBorder icon={<Trash />} />
    <Dialog onClose={() => setIsVisible(false)} title="Confirmation" isOpen={isVisible}>
      <DialogBody icon={<ExclamationMarkCircle />}>
        <Flex direction="column" alignItems="center" gap={2}>
          <Flex justifyContent="center">
            <Typography id="confirm-description">Are you sure you want to delete this?</Typography>
          </Flex>
        </Flex>
      </DialogBody>
      <DialogFooter startAction={<Button onClick={() => setIsVisible(false)} variant="tertiary">
        Cancel
      </Button>} endAction={<Button onClick={onDelete} variant="danger-light" startIcon={<Trash />}>
        Confirm
      </Button>} />
    </Dialog>
  </>
}

function Item ({index}: {index: number}) {
  const name = useContextSelector(EmailContext, v => v.list[index].name);
  const slug = useContextSelector(EmailContext, v => v.list[index].slug);
  const id = useContextSelector(EmailContext, v => v.list[index].id);
  const isDefault = useContextSelector(EmailContext, v => v.list[index].isDefault);
  const setList = useContextSelector(EmailContext, v => v.setList);
  const { pathname } = useLocation();
  const location = useLocation();

  const onDelete = useCallback(async () => {
    const { del } = getFetchClient();
    try {
      await del('/content-manager/collection-types/plugin::strapi-react-email.react-email-template/' + id);
      setList(s => {
        const list = s.slice();
        list.splice(index, 1);
        return list;
      });
    } catch (err) {

    }
  }, [id, index]);

  return <Tr>
    {/*<Td>
      <BaseCheckbox aria-label={`Select ${name}`} />
    </Td>*/}
    <Td>{id}</Td>
    <Td>{slug}</Td>
    <Td>{name}</Td>
    <Td>
      <Flex justifyContent='end'>
        <IconButton
          to={{
            pathname: `${pathname}/${id}`,
            search: `${location.search}`
          }}
          forwardedAs={ReactRouterLink}
          label="Edit" noBorder icon={<Pencil />} />
        {!isDefault && <Box paddingLeft={1}>
          <DeleteItem onDelete={onDelete}/>
        </Box>}
      </Flex>
    </Td>
  </Tr>
}

function List () {
  const length = useContextSelector(EmailContext, v => v.list.length);
  return <Box paddingRight='56px'  paddingLeft='56px' background="neutral100">
    <Table colCount={3}>
      <Thead>
        <Tr>
          {/*<Th>
            <BaseCheckbox aria-label="Select all entries" />
          </Th>*/}
          <Th>
            <Typography variant="sigma">ID</Typography>
          </Th>
          <Th>
            <Typography variant="sigma">Slug</Typography>
          </Th>
          <Th>
            <Typography variant="sigma">Name</Typography>
          </Th>
          <Th>
            <VisuallyHidden>Actions</VisuallyHidden>
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {Array.from({length}).map((_, i) => <Item key={`list_item_${i}`} index={i}/>)}
      </Tbody>
    </Table>

  </Box>
}

interface Query extends I18nBaseQuery {
  pageSize?: string;
  page: number
}

const HomePage = () => {

  const setList = useContextSelector(EmailContext, v => v.setList);
  const setPagination = useContextSelector(EmailContext, v => v.setPagination);
  const pageCount = useContextSelector(EmailContext, v => v.pagination.pageCount);
  const [{ query }] = useQueryParams<Query>();
  const { pathname, search } = useLocation();

  const loadData = async () => {
    const { get } = getFetchClient();
    try {
      const res = await get('/content-manager/collection-types/plugin::strapi-react-email.react-email-template', {
        params: {
          page: query.page || 1,
          pageSize:  query.pageSize || 10,
          sort: 'id:ASC',
          locale: query.plugins?.i18n?.locale || undefined
        }
      });
      setPagination(res.data.pagination);
      setList(res.data.results);
    } catch (err) {

    }
  }

  useEffect( () => {
    loadData();
  }, [query.page, query.pageSize, (query.plugins?.i18n?.locale || '')]);

  return (
    <div>
      <BaseHeaderLayout
        primaryAction={<Button
          to={{
            pathname: `${pathname}/create`,
            search,
          }}
          forwardedAs={ReactRouterLink} startIcon={<Plus />}>Add template</Button>}
        title='React email'
        subtitle='Sometimes code is better than graphical editor'></BaseHeaderLayout>
      <ActionLayout endActions={<SelectLanguage/>} />
      <List/>
      <Box padding='56px'>
        <Flex justifyContent='space-between'>
          <PageSizeURLQuery options = {['1', '10', '20', '50', '100']}/>
          <PaginationURLQuery pagination={{pageCount}}/>
        </Flex>
      </Box>

    </div>
  );
};

interface IPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface ITemplate {
  originCode: string;
  responseEmail: string;
  shipperEmail: string;
  shipperName: string;
  subject: string;
  testData: string;
  id?: number;
  name: string;
  slug: string;
  locale?: string;
  isDefault: boolean;
  localizations?: ITemplate[];
}

interface IContext {
  pagination: IPagination;
  setPagination: Dispatch<SetStateAction<IPagination>>;
  list: ITemplate[];
  setList: Dispatch<SetStateAction<ITemplate[]>>;
}


const EmailContext = createContext<IContext>({
  // @ts-ignore
  pagination: {},
  setPagination: () => null,
  list: [],
  setList: () => null,
})

function HomePageWrapper({children}: {children: ReactNode}) {
  const [pagination, setPagination] = useState<IPagination>({ page: 1, pageSize: 10, pageCount: 1, total: 1 });
  const [list, setList] = useState<ITemplate[]>([]);

  return <EmailContext.Provider value={{
    list,
    setList,
    pagination,
    setPagination }}>{children}</EmailContext.Provider>;
}



export default function () {
  return <HomePageWrapper>
    <HomePage/>
  </HomePageWrapper>
};
