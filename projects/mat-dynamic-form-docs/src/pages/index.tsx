import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import CodeBlock from '@theme/CodeBlock';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

const example = `this.formStructure = new FormStructure('Sign Up', [
  new Input('name', 'Name').apply({ icon: 'person', maxCharCount: 100 }),
  new DatePicker('birthDate', 'Birth date'),
  new Dropdown('status', 'Civil status', [
    new OptionChild('Single', 'SI'),
    new OptionChild('Married', 'MR'),
  ]),
], [
  new Button('save', 'Save', { style: 'primary', onEvent: ({ structure }) => save(structure.getValue()) })
    .apply({ validateForm: true }),
]);`;

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link className="button button--secondary button--lg" to="/docs/getting-started/installation">
            Get started
          </Link>
          <Link className="button button--secondary button--lg" to="/docs/migration/upgrade-to-1.7.0">
            Upgrade to 1.7.0
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="Dynamic Angular Material forms"
      description="Mat Dynamic Form builds complete Angular Material reactive forms from a FormStructure object.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <section className="container margin-bottom--xl">
          <Heading as="h2" className="text--center">A whole form in one object</Heading>
          <CodeBlock language="typescript">{example}</CodeBlock>
        </section>
      </main>
    </Layout>
  );
}
