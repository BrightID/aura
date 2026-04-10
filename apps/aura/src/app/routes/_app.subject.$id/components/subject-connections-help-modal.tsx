import { useEffect, useState } from 'react';
import { SiGitbook } from 'react-icons/si';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router';
import remarkGfm from 'remark-gfm';

import Dropdown from '@/components/Shared/Dropdown';
import { AuraFilterId } from '@/hooks/useFilters';
import { AuraSortId } from '@/hooks/useSorts';

const smartSortHelpContent = `#### **1. Smart Sort (Default View)**  


The **Smart Sort** view intelligently organizes your connections into three tiers to help you prioritize interactions:

- **First Tier:**  
  Connections who are mutual and are already marked as "Known+" (you have explicitly recognized them as known). These are shown **most recent first**, helping you quickly see updates from your closest connections.  

- **Second Tier:**  
  Connections who are already marked as "Known+" but aren’t mutual. These are also sorted **most recent first**.  

- **Third Tier:**  
  All remaining connections that don’t fall into the first or second tier. These are shown **most recent first**, allowing you to review updates from other connections.
`;

const expectedSortHelpContent = `#### **2. Expected Connections (Default Option)**  
The **Expected Connections** view highlights users who you might interact with most often:

- **First Tier:**  
  Connections who are both mutual and marked as "Known+". These are shown **most recent first**.  

- **Second Tier:**  
  All other connections not included in the first tier. These are also sorted **most recent first**.  

This view provides a streamlined approach to focus on the most likely interactions.`;

const theirRecoveryHelpContent = `#### **3. Their Recovery**  
This view displays **connections who you selected as your recovery contacts**. These individuals have been entrusted to help recover your account if necessary.  


Connections in this view are sorted **most recent first**, so you can easily review recent interactions or changes.`;

const recoveryHelpContent = `#### **4. Recovery**  
This view lists **connections who selected you as their recovery contact**. Being someone’s recovery contact is an important responsibility, and this view ensures you can see and manage those relationships clearly.  


Connections are shown **most recent first**, keeping the most recent selections at the top.`;

const alreadyKnownHelpContent = `#### **5. Already Known+**  
This view displays all the connections you have explicitly marked as "Known+".  


These connections are sorted **most recent first**, making it easy to stay updated with their latest activity.

`;

const helpContentsByValue: { [key: number]: string } = {
  0: smartSortHelpContent,
  1: expectedSortHelpContent,
  2: theirRecoveryHelpContent,
  3: recoveryHelpContent,
  4: alreadyKnownHelpContent,
};

const dropdownOptions = [
  {
    value: 0,
    label: <p>Smart Sort (default)</p>,
    filterIds: null,
    sortId: null,
  },
  ...[
    {
      value: 2,
      label: <p>Their Recovery</p>,
      filterIds: [AuraFilterId.TheirRecovery],
      sortId: AuraSortId.ConnectionLastUpdated,
      ascending: false,
    },
    {
      value: 3,
      label: <p>Recovery</p>,
      filterIds: [AuraFilterId.ConnectionTypeRecovery],
      sortId: AuraSortId.ConnectionLastUpdated,
      ascending: false,
    },
    {
      value: 4,
      label: <p>Already known+</p>,
      filterIds: [AuraFilterId.ConnectionTypeAlreadyKnownPlus],
      sortId: AuraSortId.ConnectionLastUpdated,
      ascending: false,
    },
  ],
];


const gitBookLinks: { [key: number]: string } = {
  0: 'https://brightid.gitbook.io/aura/advanced-features/filters#smart-sort-default',
  1: 'https://brightid.gitbook.io/aura/advanced-features/filters#expected-connections',
  2: 'https://brightid.gitbook.io/aura/advanced-features/filters#their-recovery',
  3: 'https://brightid.gitbook.io/aura/advanced-features/filters#recovery',
  4: 'https://brightid.gitbook.io/aura/advanced-features/filters#already-known',
}

export default function SubjectConnectionsHelpBody({
  selectedItemIndex = 0,
}: {
  selectedItemIndex?: number;
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(
    dropdownOptions.find((item) => item.value === selectedItemIndex) ??
      dropdownOptions[0],
  );

  useEffect(() => {
    setSelectedItem(
      dropdownOptions.find((item) => item.value === selectedItemIndex) ??
        dropdownOptions[0],
    );
  }, [selectedItemIndex]);

  return (
    <div className="leading-loose no-scrollbar text-base max-h-96 overflow-y-auto">
      <Link
        className="text-sm flex items-center gap-4"
        target="_blank"
        to={gitBookLinks[selectedItem.value]}
      >
        <SiGitbook /> Gitbook
      </Link>
      <p className="text-sm mt-4">
        Explore and manage your connections with different views to organize and
        interact effectively.
      </p>
      <Dropdown
        isDropdownOpen={isDropdownOpen}
        setIsDropdownOpen={setIsDropdownOpen}
        items={dropdownOptions}
        selectedItem={selectedItem}
        onItemClick={(item) => {
          setSelectedItem(item);
        }}
        className="h-10 mt-6 !w-full"
      />
      <hr className="my-6" />
      <ReactMarkdown
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-3xl font-bjiu8old text-blue-600" {...props} />
          ),
          hr: ({ node, ...props }) => <hr className="my-5" {...props} />,
          a: ({ node, ...props }) => (
            <a className="text-blue-500 hover:underline" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="mt-5 text-sm" {...props}></p>
          ),
        }}
        remarkPlugins={[remarkGfm]}
      >
        {helpContentsByValue[selectedItem.value]}
      </ReactMarkdown>
      {/* <ReactMarkdown
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-3xl font-bjiu8old text-blue-600" {...props} />
          ),
          hr: ({ node, ...props }) => <hr className="my-5" {...props} />,
          a: ({ node, ...props }) => (
            <a className="text-blue-500 hover:underline" {...props} />
          ),
          p: ({ node, ...props }) => <p className="mt-5" {...props}></p>,
        }}
        remarkPlugins={[remarkGfm]}
      >
        {`### **How to Use These Views**
- Use the **Smart Sort** and **Expected Connections** views to prioritize interactions and stay connected with important users.
- Check the **Their Recovery** and **Recovery** views to manage recovery relationships effectively.
- Utilize the **Already Known+** view to quickly access trusted connections.`}
      </ReactMarkdown> */}
    </div>
  );
}
