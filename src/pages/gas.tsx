import React from 'react'
import { GetStaticProps } from 'next'
import { Category } from 'types/category'
import { NavigationProvider } from 'context/navigation'
import { DEFAULT_REVALIDATE_PERIOD } from 'utils/constants'
import styles from './pages.module.scss'
import { SEO } from 'components/SEO'
import { MarkdownContentService } from 'services/content'
import { Heatmap } from 'components/heatmap'
import { GasPriceService } from 'services/gas'
import { Heatmap as HeatmapType } from 'types/gas'
import Link from 'next/link'
import { GasData } from 'components/gas-data'
import { GasTable } from 'components/gas-table'
import { TopnavLayout } from 'components/layouts/topnav'
import { Panel } from 'components/panel'
import { useEtherPrice } from 'hooks/useEtherPrice'
import { useGasPrice } from 'hooks/useGasPrice'
import { GasNotifications } from 'components/gas-notifications'

interface Props {
  categories: Array<Category>
  heatmap: HeatmapType
}

export default function Index(props: Props) {
  const { gasPrice, priorityFee } = useGasPrice(15000)
  const etherPrice = useEtherPrice(15000)
  const title = gasPrice > 0 ? `${gasPrice} Gwei` : 'Ethereum Gas tracker'

  return (
    <NavigationProvider categories={props.categories}>
      <SEO title={title} divider="⛽" description="Monitor and track the Ethereum gas price to reduce transaction fees save money." />
      <TopnavLayout className={styles.container} title="Ethereum Gas tracker" action={{ href: '/gas/api', text: 'Get API Access' }}>
        <section>
          <p>
            <Panel fill>
              ⛽ {gasPrice > 0 ? gasPrice : '-'} Max fee | {priorityFee > 0 ? priorityFee : '-'} priority
            </Panel>
          </p>
        </section>

        <article>
          <p>
            Gas is a fundamental element for any public blockchain network such as Ethereum. Understanding how it works is key to efficiently use and
            develop on Ethereum and can greatly reduce the gas fees, required to deploy and transact with the network.
          </p>
        </article>

        <GasData />

        <GasNotifications />

        <article className="markdown">
          <h2>Average Ethereum Transaction costs</h2>
          <GasTable gasPrice={gasPrice} etherPrice={etherPrice} />
        </article>

        <article className="markdown">
          <h2>Average Ethereum Gas Prices per hour</h2>
          <Heatmap data={props.heatmap.data} x={props.heatmap.x} y={props.heatmap.y} />
        </article>

        <article className="markdown">
          <h3>Ethereum Gas explained</h3>
          <p>
            Gas is an important concept within the Web3 world. It is the virtual fuel required to execute transactions on the network. Similar to how
            a car needs gasoline to drive. Most public blockchains denominate these transaction fees in their native currency.
          </p>
          <p>There are a few crucial aspects of using gas or transaction fees in public, permissionless networks:</p>
          <ol>
            <li>
              Every transaction published on a blockchain imposes a cost of downloading, executing and verify it. People who run a node (validators)
              spend time, money and effort to do this for which they are compensated. Transaction fees are rewarded to them for providing these
              services.
            </li>
            <li>
              A fee market allows prioritization of transactions by &apos;tipping&apos; the validators for processing specific transactions more
              quickly.
            </li>
            <li>
              For smart contract platforms, it avoids computational waste in code, by setting a limit to how many steps of code executions it can
              perform within a transaction.
            </li>
            <li>
              Additionally, it prevents accidental or hostile infinite loops, e.g. denial of service (&apos;DDoS&apos;) attacks. In a DDoS attack, an
              attacker tries to flood the network by spamming empty transactions. A fee market ensures that doing such attacks, for an extended period
              of time, to become expensive.
            </li>
          </ol>
        </article>

        <article className={`${styles.gas} markdown`}>
          <h3>Further reading</h3>
          <ul>
            <li>
              <Link href="https://ethereum.org/en/developers/docs/gas/">https://ethereum.org/en/developers/docs/gas/</Link>
            </li>
            <li>
              <Link href="https://www.blocknative.com/gas-platform">https://www.blocknative.com/gas-platform</Link>
            </li>
          </ul>
        </article>
      </TopnavLayout>
    </NavigationProvider>
  )
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const service = new MarkdownContentService()
  const categories = await service.GetCategories()

  const gasService = new GasPriceService()
  const gasPrices = await gasService.GetPrices()
  const heatmap = gasService.AsHeatmapData(gasPrices)

  return {
    props: {
      categories,
      heatmap,
    },
    revalidate: DEFAULT_REVALIDATE_PERIOD,
  }
}
